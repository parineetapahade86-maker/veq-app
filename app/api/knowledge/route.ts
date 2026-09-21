import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) return NextResponse.json({ items: [] })

    const { data, error } = await supabase
        .from('employee_knowledge')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    const items = data.map((item: any) => ({
        id: item.id,
        title: item.source_reference || 'Manual Entry',
        tags: item.metadata?.tags || ['manual'],
        summary: item.content,
        source_type: item.source_type,
        created_at: new Date(item.created_at).toLocaleDateString()
    }))

    return NextResponse.json({ items })
}

export async function POST(request: Request) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

    const { title, summary, tags } = await request.json()

    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('employee_knowledge')
        .insert({
            employee_id: user.id,
            company_id: profile.company_id,
            content: summary,
            source_type: 'manual',
            source_reference: title,
            metadata: { tags }
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
}