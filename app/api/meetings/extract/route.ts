import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import OpenAI from 'openai'

// OpenRouter client (OpenAI-compatible API)
const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

// Maximum allowed length for meeting notes (protects against huge payloads burning API credits)
const MAX_NOTES_LENGTH = 50_000

// POST /api/meeting-extract
// Analyzes meeting notes with AI, extracts structured data, and saves it to the Knowledge Vault
export async function POST(req: NextRequest) {
    try {
        // Authenticate the user
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get the Supabase server client
        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        // Look up the user's company
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 400 })
        }

        // Validate the request body
        const { meetingTitle, rawNotes } = await req.json()

        if (!rawNotes || !rawNotes.trim()) {
            return NextResponse.json({ error: 'Meeting notes are required' }, { status: 400 })
        }

        // 🔒 Limit notes length to protect API credits and avoid token limits
        if (rawNotes.length > MAX_NOTES_LENGTH) {
            return NextResponse.json(
                { error: `Notes too long (max ${MAX_NOTES_LENGTH.toLocaleString()} characters)` },
                { status: 413 }
            )
        }

        // 🧠 EXTRACT MEETING KNOWLEDGE USING AI
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert meeting assistant. Analyze the meeting notes/transcript and extract key information. 
                    Return ONLY a valid JSON object with this exact structure:
                    {
                      "decisions": ["Decision 1", "Decision 2"],
                      "action_items": [{"task": "Task description", "assignee": "Person name or 'Unassigned'"}],
                      "important_dates": ["Date 1 with context", "Date 2 with context"],
                      "responsible_persons": ["Person 1", "Person 2"]
                    }
                    If a category has no data, use an empty array. Be concise and accurate.`
                },
                {
                    role: 'user',
                    content: `Meeting Title: meetingTitle∣∣′UntitledMeeting′\n\nNotes/Transcript:\n{meetingTitle || 'Untitled Meeting'}\n\nNotes/Transcript:\nmeetingTitle∣∣′UntitledMeeting′\n\nNotes/Transcript:\n{rawNotes}`
                }
            ],
            temperature: 0.2,
        })

        // Parse the AI response into structured data (fall back to empty structure on failure)
        let extractedData = { decisions: [], action_items: [], important_dates: [], responsible_persons: [] }
        try {
            let aiText = completion.choices[0].message.content || '{}'
            // Strip markdown code fences (```json ... ```) if the model adds them
            aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim()
            extractedData = JSON.parse(aiText)
        } catch (parseError) {
            console.error('[Meeting Extract] JSON Parse Error:', parseError)
        }

        // 💾 SAVE TO THE KNOWLEDGE VAULT (Source Type: 'meeting')
        const { data: savedData, error: saveError } = await supabase
            .from('employee_knowledge')
            .insert({
                employee_id: userId,
                company_id: profile.company_id,
                content: rawNotes,
                source_type: 'meeting',
                source_reference: meetingTitle || 'Untitled Meeting',
                metadata: {
                    extracted: extractedData,
                    source: 'meeting_notes'
                }
            })
            .select()
            .single()

        if (saveError) {
            console.error('[Meeting Extract] DB Save Error:', saveError)
            throw saveError
        }

        return NextResponse.json({
            success: true,
            data: savedData,
            extracted: extractedData
        }, { status: 201 })

    } catch (error: any) {
        console.error('[Meeting Extract] Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
