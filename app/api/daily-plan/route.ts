import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
})

// ---------- Types & Helpers ----------

interface Task {
    title: string
    priority: 'high' | 'medium' | 'low'
    notes: string
}

/**
 * Get today's date in the user's local timezone.
 * Default: Asia/Kolkata (IST). Fixes the UTC bug where
 * "today" was wrong for Indian users before 5:30 AM UTC.
 */
function getToday(timezone = 'Asia/Kolkata'): string {
    return new Date().toLocaleDateString('en-CA', { timeZone: timezone })
    // 'en-CA' locale gives us the "YYYY-MM-DD" format directly
}

/**
 * Safely parse and validate the AI response.
 * Handles markdown code fences, invalid JSON, and wrong shapes.
 */
function parseTasks(raw: string | null, fallbackText: string): Task[] {
    if (!raw) return fallbackTask(fallbackText)

    // Strip markdown code fences if the model wraps JSON in them
    const cleaned = raw.replace(/```json|```/g, '').trim()

    try {
        const parsed = JSON.parse(cleaned)
        if (!Array.isArray(parsed)) return fallbackTask(fallbackText)

        const tasks = parsed
            .filter((t) => t && typeof t.title === 'string' && t.title.trim())
            .map((t) => ({
                title: t.title.trim().slice(0, 200),
                priority: ['high', 'medium', 'low'].includes(t.priority) ? t.priority : 'medium',
                notes: typeof t.notes === 'string' ? t.notes.slice(0, 500) : '',
            }))

        return tasks.length > 0 ? tasks : fallbackTask(fallbackText)
    } catch {
        return fallbackTask(fallbackText)
    }
}

/** Fallback: use the raw text as a single task if AI parsing fails */
function fallbackTask(text: string): Task[] {
    return [{
        title: text.slice(0, 200),
        priority: 'medium',
        notes: 'AI response could not be parsed',
    }]
}

// ---------- GET: Fetch today's plan ----------
export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        const today = getToday()

        // maybeSingle() returns null instead of throwing when no row exists,
        // so there's no need to handle the PGRST116 error code manually
        const { data, error } = await supabase
            .from('daily_plans')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle()

        if (error) throw error

        return NextResponse.json({ success: true, data: data ?? null })
    } catch (err) {
        console.error('[Daily Plan GET] Error:', err)
        return NextResponse.json({ error: 'Failed to fetch plan' }, { status: 500 })
    }
}

// ---------- POST: Generate tasks with AI and save them ----------
export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        const { rawText } = await req.json()
        const text = typeof rawText === 'string' ? rawText.trim() : ''

        if (!text) {
            return NextResponse.json({ error: 'No text provided' }, { status: 400 })
        }
        if (text.length > 5000) {
            return NextResponse.json({ error: 'Text too long (max 5000 characters)' }, { status: 400 })
        }

        // ✅ STEP 1: Get the user's company_id
        const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (profileError || !userProfile?.company_id) {
            console.error('[Daily Plan] No company found for user:', userId)
            return NextResponse.json(
                { error: 'Company not found. Please create a company first.' },
                { status: 400 }
            )
        }

        const companyId = userProfile.company_id

        // ✅ STEP 2: Extract tasks with AI
        const completion = await openai.chat.completions.create({
            model: 'openai/gpt-4o-mini', // ⚠️ Verify the exact model ID in your OpenRouter dashboard
            messages: [
                {
                    role: 'system',
                    content: `You are a task extraction AI. Extract clear, actionable tasks from the user's text.
Return ONLY a valid JSON array. Each object: { "title": string, "priority": "high"|"medium"|"low", "notes": string }.
If no tasks found, return []. No markdown, no explanation.`,
                },
                { role: 'user', content: `Extract tasks from this text: ${text}` },
            ],
            temperature: 0.3,
            max_tokens: 1000, // 💰 cost control
        })

        const aiText = completion.choices[0]?.message?.content ?? null
        const tasks = parseTasks(aiText, text)

        const aiSummary = `Your ${tasks.length} main tasks for today are ready! 🚀`
        const today = getToday()

        // ✅ STEP 3: Save/update in the database with company_id
        // A single upsert is atomic — safer than checking "exists" first,
        // which can cause duplicate inserts when two requests run at once.
        const { data, error } = await supabase
            .from('daily_plans')
            .upsert(
                {
                    user_id: userId,
                    company_id: companyId, // ✅ included here so updates keep it too!
                    date: today,
                    tasks,
                    ai_summary: aiSummary,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,date' } // ✅ no spaces — must match the DB unique constraint
            )
            .select()
            .single()

        if (error) {
            console.error('[Daily Plan] DB Error:', error)
            throw error
        }

        return NextResponse.json({ success: true, data, tasks })
    } catch (err) {
        console.error('[Daily Plan POST] Error:', err)
        return NextResponse.json({ error: 'Failed to process plan' }, { status: 500 })
    }
}
