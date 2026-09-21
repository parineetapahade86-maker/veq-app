// app/api/handover-colleagues/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) return NextResponse.json({ employees: [] })

    // 🔒 Critical: scoped to this user's own company only
    const { data, error } = await supabase
        .from('employees')
        .select('name')
        .eq('company_id', profile.company_id)
        .eq('is_handover_initiated', true)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ employees: data || [] })
}