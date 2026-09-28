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

        // 3. Parse request body safely
        const body = await req.json();
        const { companyId, recentActivities } = body;
        const userId = req.headers.get('x-user-id') || 'system-agent';

        // 4. ULTIMATE ENTERPRISE AI PROMPT
        const prompt = `
      You are VEQ, an elite Enterprise AI Knowledge Continuity Agent. 
      Your mission is to analyze company activities and prevent critical knowledge loss.

      STRICT RULES:
      1. Respond ONLY with a valid JSON array. Do NOT include markdown formatting (like \`\`\`json), conversational text, or explanations.
      2. Use clear, professional, and actionable Business English.
      3. Focus on real risks: missing documentation after code merges, upcoming employee offboarding, lack of meeting notes, or outdated processes.
      
      Allowed "agent_type" values: "gap_detector", "proactive_helper", "smart_reminder", "categorizer".
      Allowed "priority" values: "high", "medium", "low".

      Analyze these recent company activities: ${JSON.stringify(recentActivities || "No recent activities provided. Suggest general knowledge base improvements.")}
      
      Return a JSON array of objects with exactly these keys: "agent_type", "title", "description", "priority".
    `;

        // 5. Call the AI Model
        const completion = await openai.chat.completions.create({
            model: "openai/gpt-4o-mini",
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.3, // Low temperature for consistent, factual JSON output
        });

        // 6. ULTRA-SAFE JSON PARSING (Handles markdown code blocks if AI sends them)
        let rawContent = completion.choices[0]?.message?.content || '{"suggestions": []}';
        const cleanContent = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();

        let parsedData;
        try {
            parsedData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError, 'Raw Content:', rawContent);
            parsedData = { suggestions: [] }; // Fallback to empty array if parsing fails
        }

        const suggestions = parsedData.suggestions || [];

        // 7. Save valid suggestions to Supabase
        if (suggestions && suggestions.length > 0) {
            const { error } = await supabase.from('ai_agent_suggestions').insert(
                suggestions.map((s: any) => ({
                    user_id: userId,
                    company_id: companyId || 'default-company',
                    agent_type: s.agent_type || 'proactive_helper',
                    title: s.title || 'AI Insight Detected',
                    description: s.description || 'Action required to maintain knowledge continuity.',
                    priority: s.priority || 'medium',
                    status: 'pending'
                }))
            );

            if (error) {
                console.error('Supabase Insert Error:', error);
                throw error;
            }
        }

        // 8. FIRE WEBHOOKS (The Automation Magic!)
        if (suggestions && suggestions.length > 0) {
            // Fetch all active webhooks for this company
            const { data: activeWebhooks } = await supabase
                .from('webhooks')
                .select('url')
                .eq('is_active', true);

            if (activeWebhooks && activeWebhooks.length > 0) {
                const payload = {
                    event: 'knowledge_gap_detected',
                    timestamp: new Date().toISOString(),
                    company_id: companyId,
                    total_alerts: suggestions.length,
                    data: suggestions
                };

                // Send POST request to all webhooks concurrently
                const webhookPromises = activeWebhooks.map((wh) =>
                    fetch(wh.url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                    }).catch((err) => console.error(`Webhook failed for ${wh.url}:`, err))
                );

                // Wait for all webhooks to finish (or fail) without blocking the main response
                await Promise.allSettled(webhookPromises);
                console.log(`Fired ${activeWebhooks.length} webhooks successfully.`);
            }
        }

        // 9. Return success response
        return NextResponse.json({
            success: true,
            count: suggestions.length,
            message: `AI scan completed. ${suggestions.length} actionable insights generated and webhooks fired.`
        });

    } catch (error) {
        console.error('AI Agent Scan Critical Error:', error);
        return NextResponse.json(
            { error: 'Failed to run AI scan. Please try again later.' },
            { status: 500 }
        );
    }
}