import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';
import OpenAI from 'openai';

// 🚀 Initialize Groq Client
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

// 🧠 Define the 8 Specialized Agents as Groq Tools
const agentTools = [
    { type: 'function' as const, function: { name: 'exit_agent', description: 'Handles departing employee knowledge capture, handover checklists, pending tasks, and undocumented workflows.' } },
    { type: 'function' as const, function: { name: 'onboarding_agent', description: 'Handles new employee setup, IT/HR checklists, team introductions, and training templates.' } },
    { type: 'function' as const, function: { name: 'knowledge_agent', description: 'Answers general questions about company knowledge, documented SOPs, policies, and historical data.' } },
    { type: 'function' as const, function: { name: 'meeting_agent', description: 'Manages meeting notes, extracts decisions, assigns follow-up tasks, and tracks action items.' } },
    { type: 'function' as const, function: { name: 'process_agent', description: 'Executes standard operating procedures (SOPs), runs workflows, and checks process compliance.' } },
    { type: 'function' as const, function: { name: 'research_agent', description: 'Conducts internal company research, analyzes data, and finds specific information across documents.' } },
    { type: 'function' as const, function: { name: 'manager_agent', description: 'Provides executive summaries, identifies risks, analyzes team performance, and gives strategic overviews.' } },
    { type: 'function' as const, function: { name: 'memory_agent', description: 'Maintains and retrieves important organizational memory, historical context, and long-term company knowledge.' } },
];

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { message, employeeName } = await req.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const supabase = getSupabase();
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        // 1. Let Groq decide the intent
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: `You are the VEQ Orchestrator. Analyze the user's message and select the single best specialized agent to handle it.` },
                { role: 'user', content: message },
            ],
            tools: agentTools,
            tool_choice: 'auto',
        });

        const toolCall = response.choices[0].message.tool_calls?.[0];

        // ✅ SAFE TYPE ASSERTION to completely prevent TS2339 error
        const chosenAgent = (toolCall as any)?.function?.name || 'knowledge_agent';

        let agentName = 'Knowledge Agent';
        let reply = '';
        let suggestedActions: { label: string; type: string }[] = [];

        // 2. BRUTALLY HONEST ROUTING (No fake roleplay for unimplemented features)
        switch (chosenAgent) {
            case 'exit_agent':
                agentName = 'Exit Agent';
                reply = `I can help capture ${employeeName || 'this employee'}'s departing knowledge. I can generate a formal handover checklist or flag undocumented workflows.`;
                suggestedActions = [
                    { label: "Generate Handover Checklist", type: "create_task" },
                    { label: "Flag Undocumented Knowledge", type: "flag_undocumented_knowledge" },
                ];
                break;

            case 'onboarding_agent':
                agentName = 'Onboarding Agent';
                reply = `I can help set up the new hire with standard IT, HR, and team introduction steps.`;
                suggestedActions = [{ label: "Start Employee Onboarding", type: "client_onboarding" }];
                break;

            case 'memory_agent':
                agentName = 'Memory Agent';
                // 🔥 REAL DATABASE QUERY (No fake data)
                const { data: memories, error: memoryError } = await supabase
                    .from('company_memories')
                    .select('topic, content, memory_type, related_people, is_current, created_at')
                    .eq('company_id', profile?.company_id || "default")
                    .eq('is_current', true)
                    .or(`topic.ilike.%${message}%,content.ilike.%${message}%`)
                    .limit(3);

                if (memories && memories.length > 0) {
                    const memorySummary = memories.map((m: any) =>
                        `- **${m.topic}** (${m.memory_type}): ${m.content} \n  👥 Related: ${m.related_people?.join(', ') || 'None'} | 📅 ${new Date(m.created_at).toLocaleDateString()}`
                    ).join('\n\n');

                    reply = `I found ${memories.length} relevant organizational memory node(s) regarding your query:\n\n${memorySummary}`;
                    suggestedActions = [
                        { label: "Flag as Outdated / Changed", type: "update_memory_status" }
                    ];
                } else {
                    reply = `I searched our organizational memory graph, but I couldn't find any documented decisions or context matching your query. It might not be captured yet.`;
                    suggestedActions = [{ label: "Create New Memory Node", type: "create_task" }];
                }
                break;

            // 🔥 HONEST FALLBACKS FOR UNIMPLEMENTED AGENTS (No fake roleplay)
            case 'knowledge_agent':
            case 'meeting_agent':
            case 'process_agent':
            case 'research_agent':
            case 'manager_agent':
                // ✅ EXPLICIT TYPE for 'l' to prevent TS7006 error
                agentName = `${chosenAgent.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} Agent`;
                reply = `This specific agent feature is not yet connected to a real database or AI pipeline. I cannot answer this or perform actions for this agent yet.`;
                suggestedActions = [];
                break;

            default:
                agentName = 'Knowledge Agent';
                reply = `This feature is not yet built. I cannot answer this yet.`;
                suggestedActions = [];
                break;
        }

        // 3. Log the orchestration
        await supabase.from('veq_agent_tasks').insert({
            requested_by: user.id,
            company_id: profile?.company_id ?? null,
            ghost_name: employeeName || 'Unknown',
            task_type: `orchestrator_query_${chosenAgent}`,
            agent_type: agentName,
            status: 'completed',
            payload: { query: message, response: reply },
        });

        return NextResponse.json({ success: true, reply, agentName, suggestedActions });

    } catch (error) {
        console.error('Orchestrator Error:', error);
        return NextResponse.json({ success: false, error: 'Orchestrator failed' }, { status: 500 });
    }
}