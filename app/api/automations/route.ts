// app/api/automations/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get user's company_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ rules: [] })
    }

    // Fetch automation rules for this company
    const { data: rules, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to load rules' }, { status: 500 })
    return NextResponse.json({ rules: rules || [] })
}

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get user's company_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 400 })
    }

    const body = await req.json()
    const { name, trigger_event, action_type } = body

    if (!name || !trigger_event || !action_type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('automation_rules')
        .insert({
            company_id: profile.company_id,
            name,
            trigger_event,
            action_type,
            is_active: true
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
    return NextResponse.json({ rule: data })
}