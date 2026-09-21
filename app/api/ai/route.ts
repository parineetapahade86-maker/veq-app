import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { sanitizeForAI } from '@/lib/sanitizeData';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

const BASE_SYSTEM_INSTRUCTION = `
You are VEQ AI, a helpful assistant for workplace continuity. 
STRICT SECURITY RULES:
1. NEVER ask for passwords, API keys, or financial information.
2. If the user provides sensitive data (like a password or credit card), ignore it and reply: "For security reasons, I cannot process sensitive credentials. Please remove them."
3. Do not store or repeat back any sensitive personal information.

CONTEXT RULE:
Always use the [USER WORKSPACE CONTEXT] provided in the prompt to give personalized, relevant, and actionable advice about their tasks, meetings, and documents. If the context is empty, politely inform the user that they need to add data to their workspace first.
`;

export async function POST(req: Request) {
    try {
        // 1. Check the user (via Clerk)
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }
        const ai = new GoogleGenAI({ apiKey });

        const { message } = await req.json();
        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }
        const trimmedMessage = message.trim();
        if (!trimmedMessage) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }
        if (trimmedMessage.length > 5000) {
            return NextResponse.json({ error: 'Message too long' }, { status: 400 });
        }

        // 2. Fetch the user's data from Supabase (the "lens")
        const supabase = getSupabase();
        let userContext = '';

        if (supabase) {
            // Fetch tasks, meetings, and documents in parallel — 3x faster than sequential awaits
            const [tasksResult, meetingsResult, documentsResult] = await Promise.all([
                supabase
                    .from('tasks')
                    .select('title, status')
                    .eq('created_by', user.id)
                    .limit(10),
                supabase
                    .from('meetings')
                    .select('title, meeting_date')
                    .eq('created_by', user.id)
                    .limit(5),
                supabase
                    .from('documents')
                    .select('title, doc_type')
                    .eq('created_by', user.id)
                    .limit(5),
            ]);

            if (tasksResult.error) console.error('Tasks fetch error:', tasksResult.error.message);
            if (meetingsResult.error) console.error('Meetings fetch error:', meetingsResult.error.message);
            if (documentsResult.error) console.error('Documents fetch error:', documentsResult.error.message);

            const tasks = tasksResult.data;
            const meetings = meetingsResult.data;
            const documents = documentsResult.data;

            // Convert the data into a clean string
            userContext = `
            [USER WORKSPACE CONTEXT]:
            - Pending/Active Tasks: ${tasks && tasks.length > 0 ? tasks.map(t => `${t.title} (${t.status})`).join(', ') : 'None'}
            - Upcoming Meetings: ${meetings && meetings.length > 0 ? meetings.map(m => `${m.title} on ${m.meeting_date}`).join(', ') : 'None'}
            - Recent Documents: ${documents && documents.length > 0 ? documents.map(d => `${d.title} (${d.doc_type})`).join(', ') : 'None'}
            `;
        } else {
            console.error('Supabase client not configured — check env vars');
            userContext = '\n[USER WORKSPACE CONTEXT]: Database not connected. No data available.\n';
        }

        // 3. Attach the context to the user's message
        // Sanitize the context too — task/meeting/document titles are user-entered text
        // and could themselves contain emails, phone numbers, or leaked secrets
        const safeContext = sanitizeForAI(userContext);
        const safeMessage = sanitizeForAI(trimmedMessage);
        const messageWithContext = `${safeContext}\n\n[USER QUESTION]:\n${safeMessage}`;

        // 4. Send to Gemini
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: messageWithContext,
            config: {
                systemInstruction: BASE_SYSTEM_INSTRUCTION,
            },
        });

        const rawText = response.text || '';
        const safeReply = sanitizeForAI(rawText);

        return NextResponse.json({ reply: safeReply });
    } catch (error) {
        console.error('AI Route Error:', error);
        return NextResponse.json({ error: 'Failed to generate AI response' }, { status: 500 });
    }
}