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

    const body = await req.json()
    const { action, suggestionId } = body

    if (!suggestionId || typeof suggestionId !== 'string') {
        return NextResponse.json({ error: 'suggestionId is required' }, { status: 400 })
    }

    if (action !== 'approve' && action !== 'dismiss') {
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const newStatus = action === 'approve' ? 'approved' : 'dismissed'

    // 🔒 Scope the update to this company's own suggestions, restrict it to
    // suggestions that are still pending (so an already-handled one can't be
    // flipped again), and use .select() so we know if a row really changed
    const { data, error } = await supabase
        .from('agent_suggestions')
        .update({ status: newStatus })
        .eq('id', suggestionId)
        .eq('company_id', profile.company_id)
        .eq('status', 'pending')
        .select('id')

    if (error) {
        console.error('Suggestion update error:', error)
        return NextResponse.json({ error: 'Failed to update suggestion' }, { status: 500 })
    }

    if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Suggestion not found or already handled' }, { status: 404 })
    }

    return NextResponse.json({
        success: true,
        // Honest message: this only records the decision. It does not create a knowledge item.
        message: action === 'approve' ? 'Suggestion approved.' : 'Suggestion dismissed.',
    })
}