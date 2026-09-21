import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
    try {
        const { token, employeeName, companyId, responsibilities, processes, decisions, unresolved, dependencies } = await req.json();

        // Re-validate token one last time for security
        const { data: employee } = await supabase.from('employees').select('id').eq('offboarding_token', token).single();
        if (!employee) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const rawContext = `Employee: ${employeeName}\nResponsibilities: ${responsibilities}\nProcesses: ${processes}\nDecisions: ${decisions}\nUnresolved: ${unresolved}\nDependencies: ${dependencies}`;

        // (Use the exact same Groq prompt and graph insertion logic from your main exit-brain-dump route here)
        // For brevity, I am summarizing: Call Groq, parse JSON, insert into company_memories and memory_nodes/edges.

        // ... [Insert the exact Groq call and Supabase insert logic from your existing /api/exit-brain-dump/route.ts here] ...

        // Mark as completed
        await supabase.from('employees').update({ offboarding_status: 'departed' }).eq('offboarding_token', token);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Public Offboard Submit Error:', error);
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}