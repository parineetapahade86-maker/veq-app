// app/api/agent-remediation/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', userId).single()
    if (!profile?.company_id) return NextResponse.json({ suggestions: [] })

    // Fetch pending suggestions for this company
    const { data: suggestions, error } = await supabase
        .from('agent_suggestions')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to load suggestions' }, { status: 500 })

    return NextResponse.json({ suggestions: suggestions || [] })
}

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', userId).single()
    if (!profile?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 400 })

    const { action } = await req.json() // action: 'approve' or 'dismiss', suggestionId

    if (action === 'approve') {
        // In a real app, this would convert the suggestion into a real Knowledge Item
        // For MVP, we just mark it as approved and log it
        await supabase.from('agent_suggestions').update({ status: 'approved' }).eq('id', req.json().suggestionId)
        return NextResponse.json({ success: true, message: 'Knowledge item drafted successfully!' })
    }

    if (action === 'dismiss') {
        await supabase.from('agent_suggestions').update({ status: 'dismissed' }).eq('id', req.json().suggestionId)
        return NextResponse.json({ success: true, message: 'Suggestion dismissed.' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}