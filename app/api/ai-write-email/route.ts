import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
    try {
        const { message, employeeName } = await req.json();

        const systemPrompt = `You are a professional HR communication assistant. 
        Convert the simple message into a professional, empathetic, and clear offboarding email.
        
        Return ONLY a JSON object with this structure:
        {
          "subject": "Clear subject line",
          "content": "Full professional email body"
        }`;

        const completion = await groq.chat.completions.create({
            model: 'openai/gpt-oss-20b', // 
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Write a professional offboarding email for ${employeeName || 'the employee'} based on this simple message: ${message}` }
            ],
            response_format: { type: 'json_object' }
        });

        const emailData = JSON.parse(completion.choices[0].message.content || '{}');

        return NextResponse.json({
            success: true,
            subject: emailData.subject || "Action Required: Exit Brain Dump",
            content: emailData.content || message
        });

    } catch (error) {
        console.error('AI Email Writer Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate email',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}