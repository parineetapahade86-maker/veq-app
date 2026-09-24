import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        // 1. Initialize OpenAI client with OpenRouter (Inside function to prevent build-time errors)
        const openai = new OpenAI({
            apiKey: process.env.OPENROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
        });

        // 2. Initialize Supabase client with Service Role Key (for secure server-side inserts)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Parse request body
        const { companyId, recentActivities } = await req.json();
        const userId = req.headers.get('x-user-id') || 'unknown-user';

        // 4. Define the AI Prompt
        const prompt = `
      You are VEQ, an enterprise-grade AI Knowledge Continuity Agent. 
      Your goal is to analyze company activities and prevent knowledge loss.

      STRICT RULES:
      1. Always respond in clear, professional Business English.
      2. Be concise, actionable, and urgent where necessary.
      3. Return ONLY a valid JSON array of objects.
      4. Each object must have exactly these keys: "agent_type", "title", "description", "priority".
      
      Analyze the following recent company activities: ${JSON.stringify(recentActivities || [])}
    `;

        // 5. Call the AI Model
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini", // Reliable and cost-effective via OpenRouter
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
        });

        // 6. Safely parse the AI response
        const content = completion.choices[0]?.message?.content || '{"suggestions": []}';
        const parsedData = JSON.parse(content);
        const suggestions = parsedData.suggestions || [];

        // 7. Save valid suggestions to Supabase
        if (suggestions && suggestions.length > 0) {
            const { error } = await supabase.from('ai_agent_suggestions').insert(
                suggestions.map((s: any) => ({
                    user_id: userId,
                    company_id: companyId || 'default-company',
                    agent_type: s.agent_type || 'proactive_helper',
                    title: s.title || 'AI Insight',
                    description: s.description || 'No description provided.',
                    priority: s.priority || 'medium',
                    status: 'pending'
                }))
            );

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }
        }

        // 8. Return success response
        return NextResponse.json({
            success: true,
            count: suggestions.length,
            message: 'AI scan completed and suggestions saved successfully.'
        });

    } catch (error) {
        console.error('AI Agent Scan Error:', error);
        return NextResponse.json(
            { error: 'Failed to run AI scan. Please try again later.' },
            { status: 500 }
        );
    }
}