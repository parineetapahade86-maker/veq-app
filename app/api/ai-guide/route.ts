import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: Request) {
    try {
        const { query } = await request.json()

        const apiKey = process.env.GROQ_API_KEY

        if (!apiKey) {
            console.error("❌ GROQ_API_KEY missing in .env.local")
            return NextResponse.json(
                { error: 'API Key missing', response: 'Please add GROQ_API_KEY to your .env.local file' },
                { status: 500 }
            )
        }

        const openai = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.groq.com/openai/v1",
        })

        const systemPrompt = `You are VEQ AI, an intelligent and helpful workspace assistant for a productivity platform called VEQ.

VEQ helps teams manage:
- Knowledge Base & Documentation
- Employee Onboarding & Offboarding
- Tasks & Meetings
- Integrations (Slack, GitHub, Google)
- AI-powered insights

Instructions:
- Provide a helpful, concise, and professional response.
- If the question is about VEQ features, guide them clearly.
- Keep the tone friendly and productive.`

        // ✅ YE GUARANTEED WORKING MODEL HAI GROQ PAR
        const completion = await openai.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: query }
            ],
            temperature: 0.7,
            max_tokens: 1024
        })

        const aiResponse = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        return NextResponse.json({ response: aiResponse })

    } catch (error: any) {
        console.error('❌ Groq API Error:', error)
        return NextResponse.json(
            { error: error.message || 'Groq API failed', response: 'Sorry, AI unavailable' },
            { status: 500 }
        )
    }
}