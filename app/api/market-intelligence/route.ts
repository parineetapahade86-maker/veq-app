import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        const { industry, products, targetAudience, competitors } = await req.json();

        // ============================================
        // 1. LIVE MARKET RESEARCH (TAVILY API)
        // ============================================
        const searchQuery = `latest market trends, customer demands, and competitor news for ${industry} industry focusing on ${products} in 2024`;

        const tavilyResponse = await fetch('https://api.tavily.com/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: process.env.TAVILY_API_KEY,
                query: searchQuery,
                search_depth: "advanced",
                include_answer: true,
                max_results: 5,
                include_raw_content: false
            })
        });

        const tavilyData = await tavilyResponse.json();

        // Extract clean text from live search results
        let liveContext = "";
        if (tavilyData.results && tavilyData.results.length > 0) {
            liveContext = tavilyData.results.map((result: any) =>
                `Title: ${result.title}\nContent: ${result.content}`
            ).join('\n\n');
        } else {
            liveContext = "No live data found. Use your general knowledge.";
        }

        // ============================================
        // 2. AI ANALYSIS (GROQ) WITH LIVE DATA
        // ============================================
        const systemPrompt = `You are an elite AI Market Intelligence & Growth Advisor. 
        Analyze the provided LIVE market data and company details to generate a comprehensive, actionable report.
        
        STRICT RULES:
        1. Output MUST be valid JSON matching the exact schema below.
        2. Do not add any markdown formatting (like \`\`\`json). Just pure JSON.
        3. Base your insights STRICTLY on the provided LIVE DATA. If live data is scarce, use your advanced business knowledge.

        SCHEMA:
        {
          "marketGrowth": [
            {"month": "Jan", "trend": "up" | "down" | "stable", "explanation": "Brief reason based on live data"}
          ],
          "customerDemands": ["Demand 1", "Demand 2", "Demand 3"],
          "opportunities": [
            {"current": "Current state", "signal": "Market signal from news", "insight": "Actionable business opportunity"}
          ],
          "mindMap": {
            "Market Trends": ["Trend 1", "Trend 2"],
            "Competitors": ["Competitor move 1", "Competitor move 2"],
            "Risks": ["Risk 1", "Risk 2"],
            "New Products": ["Idea 1", "Idea 2"]
          },
          "keyInsights": [
            {"icon": "", "text": "Insight 1"},
            {"icon": "🔥", "text": "Insight 2"},
            {"icon": "⚠️", "text": "Insight 3"}
          ],
          "nextSteps": [
            {"action": "What to do", "impact": "Why it matters"}
          ]
        }`;

        const userPrompt = `
        LIVE MARKET DATA:
        ${liveContext}

        COMPANY DETAILS:
        Industry: ${industry}
        Products/Services: ${products}
        Target Audience: ${targetAudience}
        Competitors: ${competitors || 'Not specified'}
        
        Generate the market intelligence report based on the LIVE DATA and company details.
        `;

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b', // Working model
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' }
        });

        const rawData = completion.choices[0].message.content || '{}';
        const cleanData = rawData.replace(/^```json\n?|\n?```$/g, '');
        const intelligenceData = JSON.parse(cleanData);

        return NextResponse.json({ success: true, data: intelligenceData });

    } catch (error) {
        console.error('Market Intelligence API Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to generate market intelligence' }, { status: 500 });
    }
}