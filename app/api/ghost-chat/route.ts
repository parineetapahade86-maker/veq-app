import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';
import OpenAI from 'openai';

// Using Groq for speed and cost-efficiency (matches our previous setup)
// If you prefer OpenAI, just change the baseURL and apiKey back to process.env.OPENAI_API_KEY
const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        // 🔒 1. AUTHENTICATION: Ensure a real user is making the request
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { message, employeeName } = await req.json();

        if (!message || !employeeName) {
            return NextResponse.json({ error: 'Message and Employee Name are required' }, { status: 400 });
        }

        const supabase = getSupabase();
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

        // 🔒 2. SECURITY: Get the user's company_id to prevent cross-company data leaks
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;
        if (!companyId) {
            return NextResponse.json({ error: 'No company found for this user' }, { status: 400 });
        }

        // 3. FETCH THE "GHOST'S" MEMORIES FROM OUR ACTUAL TABLES
        // We look in company_memories for anything related to this employee
        const { data: memories, error } = await supabase
            .from('company_memories')
            .select('topic, memory_type, content, outcome_status, outcome_notes')
            .eq('company_id', companyId)
            .contains('related_people', [employeeName]) // Only get memories linked to this person
            .eq('is_current', true)
            .limit(15); // Keep context window manageable

        if (error) {
            console.error('Supabase fetch error:', error);
            return NextResponse.json({ error: 'Failed to fetch ghost memory' }, { status: 500 });
        }

        // 4. CONSTRUCT THE "SOUL" (Context Prompt)
        let context = `You are the AI Digital Twin (Ghost) of ${employeeName}. You are talking to a new team member at our company. 
        
        STRICT RULES:
        1. Answer their question based ONLY on the recorded knowledge provided below. 
        2. Speak in the first person ("I", "my", "mere experience mein"). Be helpful, concise, and slightly informal, like a senior colleague passing on their legacy.
        3. If you don't know, say EXACTLY: "Yaar, ye mere dimaag mein abhi save nahi hai, but tum VEQ Vault mein check kar sakte ho."
        4. DO NOT HALLUCINATE. If the context doesn't have the answer, admit it.

        --- MY RECORDED KNOWLEDGE ---
        ${memories && memories.length > 0
                ? memories.map((m: any) => {
                    let outcomeText = m.outcome_status && m.outcome_status !== 'pending'
                        ? `\n[VERIFIED OUTCOME: ${m.outcome_status.toUpperCase()} - ${m.outcome_notes}]`
                        : '';
                    return `[${m.memory_type.toUpperCase()}] ${m.topic}:\n${m.content}${outcomeText}`;
                }).join('\n\n')
                : "(Note: My digital memory is still being built. Answer generally based on standard practices, but mention that your specific records are pending.)"
            }
        -----------------------------
        `;

        // 5. CALL THE AI (Groq / OpenAI)
        const completion = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile', // Or 'gpt-4o' if you prefer OpenAI
            messages: [
                { role: 'system', content: context },
                { role: 'user', content: message }
            ],
            temperature: 0.7, // Thoda creativity for "human tone"
        });

        return NextResponse.json({
            reply: completion.choices[0].message.content,
            sourceCount: memories ? memories.length : 0
        });

    } catch (error) {
        console.error('Ghost Chat Error:', error);
        return NextResponse.json({ error: 'Failed to connect with the ghost' }, { status: 500 });
    }
}