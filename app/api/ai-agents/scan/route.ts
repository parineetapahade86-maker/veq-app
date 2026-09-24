import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
    try {
        const { companyId, recentActivities } = await req.json();

        // 1. AI PROMPT
        const prompt = `
      You are VEQ, an AI Knowledge Continuity Agent. 
      Analyze the following recent company activities: ${JSON.stringify(recentActivities)}.
      
      Identify:
      1. Knowledge Gaps (e.g., "A major PR was merged but no documentation was updated").
      2. Proactive Suggestions (e.g., "Update the onboarding doc for new hires").
      3. Smart Reminders (e.g., "Quarterly review meeting is coming up, prepare handover notes").
      
      Return a JSON array of objects with: agent_type, title, description, priority.
    `;

        // 2. Call OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Fast and cheap for agents
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
        });

        const content = completion.choices[0].message.content || '{}';
        const suggestions = JSON.parse(content).suggestions;

        // 3. Save to Supabase
        if (suggestions && suggestions.length > 0) {
            const { error } = await supabase
                .from('ai_agent_suggestions')
                .insert(
                    suggestions.map((s: any) => ({
                        user_id: req.headers.get('x-user-id'),
                        company_id: companyId,
                        agent_type: s.agent_type,
                        title: s.title,
                        description: s.description,
                        priority: s.priority,
                        status: 'pending'
                    }))
                );

            if (error) throw error;
        }

        return NextResponse.json({ success: true, count: suggestions?.length || 0 });

    } catch (error) {
        console.error('AI Agent Error:', error);
        return NextResponse.json({ error: 'Failed to run AI scan' }, { status: 500 });
    }
}