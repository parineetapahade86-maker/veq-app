import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Initialize Groq for both Whisper (Transcription) and Llama-3 (Extraction)
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    try {
        // 1. AUTHENTICATION
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 2. SECURE COMPANY ID FETCH
        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).single();
        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // 3. PARSE FORMDATA (Handles BOTH File Uploads and Text Pasting)
        const formData = await req.formData();
        const meetingTitle = formData.get('meetingTitle') as string;
        const date = formData.get('date') as string;
        const participantsStr = formData.get('participants') as string;
        const inputMode = formData.get('inputMode') as string; // 'file' or 'text'
        const file = formData.get('file') as File | null;
        const textTranscript = formData.get('transcript') as string | null;

        const participants = participantsStr ? participantsStr.split(',').map(p => p.trim()) : [];
        let transcriptText = "";

        // 4. INTELLIGENT PROCESSING: File OR Text
        if (inputMode === 'text' && textTranscript && textTranscript.trim().length > 0) {
            // User pasted text directly
            transcriptText = textTranscript;
        } else if (inputMode === 'file' && file) {
            // User uploaded audio/video -> Transcribe using Groq Whisper
            const transcription = await groq.audio.transcriptions.create({
                file: file,
                model: 'whisper-large-v3',
                response_format: 'text',
                language: 'en' // Can be made dynamic later if needed
            });
            transcriptText = transcription as unknown as string;
        } else {
            return NextResponse.json({ error: 'Please provide either an audio/video file or a text transcript.' }, { status: 400 });
        }

        // Validate that we actually got meaningful text
        if (!transcriptText || transcriptText.trim().length < 20) {
            return NextResponse.json({ error: 'Could not extract meaningful content from the input.' }, { status: 400 });
        }

        // 5. EXTRACT INTELLIGENCE USING LLAMA-3 (STRICT ANTI-HALLUCINATION)
        const systemPrompt = `You are an expert Organizational Intelligence AI. Your job is to extract actionable, structured company memory from raw meeting transcripts.
        STRICT RULES:
        1. DO NOT invent, hallucinate, or add any information not explicitly stated or strongly implied in the transcript.
        2. If a category has no meaningful information, return an empty array for that category.
        3. Extract real names for 'owner' fields if mentioned. If not mentioned, use "Unassigned".
        4. Output MUST be valid JSON matching this exact schema:
        {
          "decisions": [{"topic": "string", "context": "string", "reasoning": "string", "owner": "string"}],
          "tasks": [{"title": "string", "description": "string", "owner": "string", "deadline": "string", "priority": "low|medium|high"}],
          "risks": [{"description": "string", "impact": "string", "mitigation": "string"}],
          "sop_updates": [{"current_process": "string", "suggested_change": "string", "reason": "string"}],
          "key_context": ["string"]
        }`;

        const rawContext = `Meeting: ${meetingTitle || 'Untitled Meeting'}\nDate: ${date || 'Unknown'}\nParticipants: ${participants.join(', ') || 'Unknown'}\n\nTranscript:\n${transcriptText}`;

        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: rawContext }
            ],
            response_format: { type: 'json_object' }
        });

        const structuredData = JSON.parse(completion.choices[0].message.content || '{}');
        const meetingId = `mtg_${Date.now()}`;

        // Track where this data came from for audit purposes
        const sourceType = inputMode === 'file' ? 'meeting_intelligence_audio' : 'meeting_intelligence_text';

        const graphNodes: any[] = [];
        const graphEdges: any[] = [];

        // 6. CREATE THE MEETING NODE
        const { data: meetingNode } = await supabase
            .from('memory_nodes')
            .insert({
                company_id: companyId,
                node_type: 'meeting',
                node_label: meetingTitle || 'Untitled Meeting',
                node_data: { date, participants, key_context: structuredData.key_context || [], transcript_snippet: transcriptText.substring(0, 500) },
                source_type: sourceType,
                source_id: meetingId,
                created_by: user.id
            })
            .select()
            .single();

        if (meetingNode) graphNodes.push(meetingNode);

        // 7. CREATE PARTICIPANT NODES & EDGES
        if (participants.length > 0 && meetingNode) {
            for (const person of participants) {
                if (!person) continue;
                const { data: personNode } = await supabase
                    .from('memory_nodes')
                    .insert({
                        company_id: companyId,
                        node_type: 'person',
                        node_label: person,
                        node_data: { role: 'Meeting Participant' },
                        source_type: sourceType,
                        source_id: meetingId,
                        created_by: user.id
                    })
                    .select()
                    .single();

                if (personNode) {
                    graphNodes.push(personNode);
                    graphEdges.push({
                        company_id: companyId,
                        source_node_id: personNode.id,
                        target_node_id: meetingNode.id,
                        edge_type: 'attended',
                        edge_label: `${person} attended ${meetingTitle}`,
                        source_type: sourceType,
                        source_id: meetingId,
                        created_by: user.id
                    });
                }
            }
        }

        // 8. CREATE DECISION, TASK, RISK, AND PROCESS NODES & EDGES
        if (structuredData.decisions && meetingNode) {
            for (const dec of structuredData.decisions) {
                const { data: decisionNode } = await supabase.from('memory_nodes').insert({
                    company_id: companyId, node_type: 'decision', node_label: dec.topic,
                    node_data: { context: dec.context, reasoning: dec.reasoning, owner: dec.owner },
                    source_type: sourceType, source_id: meetingId, created_by: user.id
                }).select().single();
                if (decisionNode) {
                    graphNodes.push(decisionNode);
                    graphEdges.push({ company_id: companyId, source_node_id: meetingNode.id, target_node_id: decisionNode.id, edge_type: 'generated_decision', edge_label: `Meeting generated decision: ${dec.topic}`, source_type: sourceType, source_id: meetingId, created_by: user.id });
                }
            }
        }

        if (structuredData.tasks && meetingNode) {
            for (const task of structuredData.tasks) {
                const { data: taskNode } = await supabase.from('memory_nodes').insert({
                    company_id: companyId, node_type: 'task', node_label: task.title,
                    node_data: { description: task.description, owner: task.owner, deadline: task.deadline, priority: task.priority },
                    source_type: sourceType, source_id: meetingId, created_by: user.id
                }).select().single();
                if (taskNode) {
                    graphNodes.push(taskNode);
                    graphEdges.push({ company_id: companyId, source_node_id: meetingNode.id, target_node_id: taskNode.id, edge_type: 'created_task', edge_label: `Meeting created task: ${task.title}`, source_type: sourceType, source_id: meetingId, created_by: user.id });
                }
            }
        }

        if (structuredData.risks && meetingNode) {
            for (const risk of structuredData.risks) {
                const { data: riskNode } = await supabase.from('memory_nodes').insert({
                    company_id: companyId, node_type: 'risk', node_label: risk.description,
                    node_data: { impact: risk.impact, mitigation: risk.mitigation },
                    source_type: sourceType, source_id: meetingId, created_by: user.id
                }).select().single();
                if (riskNode) {
                    graphNodes.push(riskNode);
                    graphEdges.push({ company_id: companyId, source_node_id: meetingNode.id, target_node_id: riskNode.id, edge_type: 'identified_risk', edge_label: `Meeting identified risk`, source_type: sourceType, source_id: meetingId, created_by: user.id });
                }
            }
        }

        if (structuredData.sop_updates && meetingNode) {
            for (const sop of structuredData.sop_updates) {
                const { data: processNode } = await supabase.from('memory_nodes').insert({
                    company_id: companyId, node_type: 'process', node_label: `SOP Update: ${sop.current_process}`,
                    node_data: { suggested_change: sop.suggested_change, reason: sop.reason },
                    source_type: sourceType, source_id: meetingId, created_by: user.id
                }).select().single();
                if (processNode) {
                    graphNodes.push(processNode);
                    graphEdges.push({ company_id: companyId, source_node_id: meetingNode.id, target_node_id: processNode.id, edge_type: 'suggested_process_update', edge_label: `Meeting suggested SOP update`, source_type: sourceType, source_id: meetingId, created_by: user.id });
                }
            }
        }

        // 9. BATCH INSERT ALL NODES AND EDGES
        let insertedNodesCount = 0;
        let insertedEdgesCount = 0;

        if (graphNodes.length > 0) {
            const { data: insertedNodes, error: nodeError } = await supabase.from('memory_nodes').insert(graphNodes).select();
            if (nodeError) console.error('Meeting Intelligence Node Insert Error:', nodeError);
            else insertedNodesCount = insertedNodes?.length || 0;
        }

        if (graphEdges.length > 0) {
            const { error: edgeError } = await supabase.from('memory_edges').insert(graphEdges);
            if (edgeError) console.error('Meeting Intelligence Edge Insert Error:', edgeError);
            else insertedEdgesCount = graphEdges.length;
        }

        // 10. RETURN SUCCESS SUMMARY TO FRONTEND
        return NextResponse.json({
            success: true,
            summary: {
                meetingTitle,
                nodesCreated: insertedNodesCount,
                edgesCreated: insertedEdgesCount,
                decisions: structuredData.decisions?.length || 0,
                tasks: structuredData.tasks?.length || 0,
                risks: structuredData.risks?.length || 0,
                sopUpdates: structuredData.sop_updates?.length || 0
            }
        });

    } catch (error) {
        console.error('Meeting Intelligence Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process meeting intelligence' }, { status: 500 });
    }
}