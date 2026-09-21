// app/api/checklist-leads/route.ts — captures the email so it's not lost
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

export async function POST(request: Request) {
    const { email } = await request.json()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email' }, { status: 400 })
    }

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Save the lead — even if actual email-sending isn't built yet,
    // this way no signup is ever silently lost
    const { error } = await supabase.from('checklist_leads').insert({ email, source: 'offboarding_checklist' })

    if (error) {
        console.error('Checklist lead insert error:', error)
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
    }

    // TODO: actually send the checklist file via Resend (like the invite emails)
    // once a real PDF/Excel checklist file exists to attach

    return NextResponse.json({ success: true })
}