import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).single();
        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // ============================================
        // 1. HANDLE BOTH VOICE (FormData) AND TEXT (JSON) INPUTS
        // ============================================
        const contentType = req.headers.get('content-type') || '';
        let employeeName = '', responsibilities = '', processes = '', decisions = '', unresolved = '', dependencies = '';
        let transcriptText = '';

        if (contentType.includes('multipart/form-data')) {
            // 🎙️ VOICE RECORDING UPLOAD
            const formData = await req.formData();
            employeeName = formData.get('employeeName') as string || '';
            responsibilities = formData.get('responsibilities') as string || '';
            processes = formData.get('processes') as string || '';
            decisions = formData.get('decisions') as string || '';
            unresolved = formData.get('unresolved') as string || '';
            dependencies = formData.get('dependencies') as string || '';

            const audioFile = formData.get('audioFile') as File | null;
            const useVoiceInput = formData.get('useVoiceInput') === 'true';

            if (useVoiceInput && audioFile) {
                // Transcribe audio using Groq Whisper
                const transcription = await groq.audio.transcriptions.create({
                    file: audioFile,
                    model: 'whisper-large-v3',
                    response_format: 'text',
                    language: 'en'
                });
                transcriptText = transcription as unknown as string;

                // Combine transcript with any filled form fields
                if (transcriptText) {
                    const fullContext = `${responsibilities}\n\n${processes}\n\n${decisions}\n\n${unresolved}\n\n${dependencies}\n\nVOICE TRANSCRIPT:\n${transcriptText}`;
                    // For simplicity, we'll put everything in 'responsibilities' and let AI sort it
                    responsibilities = fullContext;
                }
            }
        } else {
            // 📝 TRADITIONAL JSON FORM SUBMISSION
            const body = await req.json();
            employeeName = body.employeeName || '';
            responsibilities = body.responsibilities || '';
            processes = body.processes || '';
            decisions = body.decisions || '';
            unresolved = body.unresolved || '';
            dependencies = body.dependencies || '';
        }

        // ============================================
        // 2. EXTRACT INTELLIGENCE USING LLAMA-3
        // ============================================
        const rawContext = `
        Employee: ${employeeName}
        Responsibilities: ${responsibilities || 'None provided'}
        Processes/SOPs: ${processes || 'None provided'}
        Key Decisions & Why: ${decisions || 'None provided'}
        Unresolved/Pending: ${unresolved || 'None provided'}
        Hidden Dependencies/Contacts: ${dependencies || 'None provided'}
        `;

        const systemPrompt = `You are an expert Knowledge Management AI. Your job is to structure raw employee exit notes into actionable company assets.
        STRICT RULES:
        1. DO NOT invent, hallucinate, or add any information not explicitly provided in the user's input.
        2. If a category has no meaningful information, return an empty array for that category.
        3. Output MUST be valid JSON matching this exact schema:
        {
          "sops": [{"title": "string", "content": "string"}],
          "decisions": [{"topic": "string", "context": "string", "reasoning": "string"}],
          "tasks": [{"title": "string", "description": "string", "urgency": "low|medium|high"}],
          "dependencies": [{"name": "string", "context": "string"}]
        }`;

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: rawContext }
            ],
            response_format: { type: 'json_object' }
        });

        const structuredData = JSON.parse(completion.choices[0].message.content || '{}');

        // ============================================
        // 3. SAVE TO COMPANY MEMORY (Real Data Only)
        // ============================================
        const memoryInserts = [];

        if (structuredData.sops) {
            for (const sop of structuredData.sops) {
                memoryInserts.push({
                    company_id: companyId,
                    topic: `SOP: ${sop.title}`,
                    memory_type: 'sop',
                    content: sop.content,
                    related_people: [employeeName],
                    is_current: true,
                    owner: employeeName
                });
            }
        }

        if (structuredData.decisions) {
            for (const dec of structuredData.decisions) {
                memoryInserts.push({
                    company_id: companyId,
                    topic: `Decision: ${dec.topic}`,
                    memory_type: 'decision',
                    content: `Context: ${dec.context}\nReasoning: ${dec.reasoning}`,
                    related_people: [employeeName],
                    is_current: true,
                    owner: employeeName
                });
            }
        }

        if (structuredData.dependencies) {
            for (const dep of structuredData.dependencies) {
                memoryInserts.push({
                    company_id: companyId,
                    topic: `Dependency: ${dep.name}`,
                    memory_type: 'lesson_learned',
                    content: dep.context,
                    related_people: [employeeName],
                    is_current: true,
                    owner: employeeName
                });
            }
        }

        if (memoryInserts.length > 0) {
            const { error: memError } = await supabase.from('company_memories').insert(memoryInserts);
            if (memError) console.error('Memory insert error:', memError);
        }

        // ============================================
        // 4. SAVE UNRESOLVED ITEMS AS PENDING TASKS
        // ============================================
        const taskInserts = [];
        if (structuredData.tasks) {
            for (const task of structuredData.tasks) {
                taskInserts.push({
                    requested_by: user.id,
                    company_id: companyId,
                    agent_type: 'process_agent',
                    ghost_name: employeeName,
                    task_type: 'create_task',
                    status: 'pending_approval',
                    audit_reason: `Captured from ${employeeName}'s exit brain dump`,
                    payload: {
                        title: task.title,
                        description: task.description,
                        urgency: task.urgency,
                        source: 'exit_brain_dump'
                    }
                });
            }
        }

        if (taskInserts.length > 0) {
            const { error: taskError } = await supabase.from('veq_agent_tasks').insert(taskInserts);
            if (taskError) console.error('Task insert error:', taskError);
        }

        // ============================================
        // 5. 🔥 AUTO-POPULATE MEMORY GRAPH (NEW ADDITION)
        // Wrapped in try-catch so graph errors don't break the main brain dump save
        // ============================================
        try {
            const hasGraphData = structuredData.sops?.length || structuredData.decisions?.length || structuredData.tasks?.length || structuredData.dependencies?.length;

            if (hasGraphData) {
                const brainDumpId = `bd_${Date.now()}`; // Unique ID for this session's graph nodes

                // 5a. Create Person node for the employee
                const { data: personNode } = await supabase
                    .from('memory_nodes')
                    .insert({
                        company_id: companyId,
                        node_type: 'person',
                        node_label: employeeName,
                        node_data: { responsibilities: responsibilities || 'Unknown' },
                        source_type: 'exit_brain_dump',
                        source_id: brainDumpId,
                        created_by: user.id
                    })
                    .select()
                    .single();

                const graphNodes = personNode ? [personNode] : [];
                const graphEdges: any[] = [];

                // 5b. Create Decision nodes and edges
                if (structuredData.decisions && personNode) {
                    for (const decision of structuredData.decisions) {
                        const { data: decisionNode } = await supabase
                            .from('memory_nodes')
                            .insert({
                                company_id: companyId,
                                node_type: 'decision',
                                node_label: decision.topic,
                                node_data: { context: decision.context, reasoning: decision.reasoning },
                                source_type: 'exit_brain_dump',
                                source_id: brainDumpId,
                                created_by: user.id
                            })
                            .select()
                            .single();

                        if (decisionNode) {
                            graphNodes.push(decisionNode);
                            graphEdges.push({
                                company_id: companyId,
                                source_node_id: personNode.id,
                                target_node_id: decisionNode.id,
                                edge_type: 'made_decision',
                                edge_label: `${employeeName} made ${decision.topic}`,
                                source_type: 'exit_brain_dump',
                                source_id: brainDumpId,
                                created_by: user.id
                            });
                        }
                    }
                }

                // 5c. Create Process/SOP nodes and edges
                if (structuredData.sops && personNode) {
                    for (const sop of structuredData.sops) {
                        const { data: processNode } = await supabase
                            .from('memory_nodes')
                            .insert({
                                company_id: companyId,
                                node_type: 'process',
                                node_label: sop.title,
                                node_data: { content: sop.content },
                                source_type: 'exit_brain_dump',
                                source_id: brainDumpId,
                                created_by: user.id
                            })
                            .select()
                            .single();

                        if (processNode) {
                            graphNodes.push(processNode);
                            graphEdges.push({
                                company_id: companyId,
                                source_node_id: personNode.id,
                                target_node_id: processNode.id,
                                edge_type: 'documented',
                                edge_label: `${employeeName} documented ${sop.title}`,
                                source_type: 'exit_brain_dump',
                                source_id: brainDumpId,
                                created_by: user.id
                            });
                        }
                    }
                }

                // 5d. Create Project nodes (from tasks) and edges
                if (structuredData.tasks && personNode) {
                    const projects = new Set<string>();
                    for (const task of structuredData.tasks) {
                        const projectName = task.title.split(' ')[0] || 'Unknown Project';

                        if (!projects.has(projectName)) {
                            projects.add(projectName);

                            const { data: projectNode } = await supabase
                                .from('memory_nodes')
                                .insert({
                                    company_id: companyId,
                                    node_type: 'project',
                                    node_label: projectName,
                                    node_data: { source_task: task.title },
                                    source_type: 'exit_brain_dump',
                                    source_id: brainDumpId,
                                    created_by: user.id
                                })
                                .select()
                                .single();

                            if (projectNode) {
                                graphNodes.push(projectNode);
                                graphEdges.push({
                                    company_id: companyId,
                                    source_node_id: personNode.id,
                                    target_node_id: projectNode.id,
                                    edge_type: 'worked_on',
                                    edge_label: `${employeeName} worked on ${projectName}`,
                                    source_type: 'exit_brain_dump',
                                    source_id: brainDumpId,
                                    created_by: user.id
                                });
                            }
                        }
                    }
                }

                // 5e. Insert all edges
                if (graphEdges.length > 0) {
                    const { error: edgeError } = await supabase.from('memory_edges').insert(graphEdges);
                    if (edgeError) console.error('Memory Graph Edge insert error:', edgeError);
                }

                console.log(`✅ Memory Graph: Created ${graphNodes.length} nodes and ${graphEdges.length} edges from Exit Brain Dump`);
            }
        } catch (graphError) {
            // Non-fatal error: We log it, but we DON'T crash the main brain dump save
            console.error('⚠️ Memory Graph Auto-Population Error (Non-fatal, main save succeeded):', graphError);
        }

        // ============================================
        // 6. RETURN SUCCESS RESPONSE
        // ============================================
        return NextResponse.json({
            success: true,
            summary: {
                sopsCreated: structuredData.sops?.length || 0,
                decisionsCaptured: structuredData.decisions?.length || 0,
                tasksGenerated: structuredData.tasks?.length || 0,
                dependenciesMapped: structuredData.dependencies?.length || 0
            }
        });

    } catch (error) {
        console.error('Exit Brain Dump Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to process brain dump' }, { status: 500 });
    }
}