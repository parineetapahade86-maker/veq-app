// app/api/audit-logs/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    // 1. Check authentication
    const { userId } = await auth()
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = getSupabase()
    if (!supabase) {
        return NextResponse.json({ error: 'Database connection failed' }, { status: 500 })
    }

    // 2. Get user's company_id
    const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

    if (profileError || !profile?.company_id) {
        console.error('Profile fetch error:', profileError)
        return NextResponse.json({ logs: [] }) // Return empty if no company
    }

    // 3. Fetch audit logs for this company only
    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })
        .limit(100) // Show last 100 entries

    if (error) {
        console.error('Audit logs fetch error:', error)
        return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 })
    }

    console.log(`✅ Fetched ${logs?.length || 0} audit logs for company ${profile.company_id}`)
    return NextResponse.json({ logs: logs || [] })
}