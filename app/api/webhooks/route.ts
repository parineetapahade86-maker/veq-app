// app/api/webhooks/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

function isValidWebhookUrl(url: string): boolean {
    try {
        const parsed = new URL(url)
        if (parsed.protocol !== 'https:') return false
        if (['localhost', '127.0.0.1', '0.0.0.0'].includes(parsed.hostname)) return false
        return true
    } catch {
        return false
    }
}

export async function GET() {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get the user's company_id (Works for ANY employee/founder in the company)
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ webhooks: [] }) // No company yet, return empty array
    }

    // Fetch webhooks ONLY for this specific company
    const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to load webhooks' }, { status: 500 })
    return NextResponse.json({ webhooks: data || [] })
}

export async function POST(req: Request) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get the user's company_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 400 })
    }

    const { url } = await req.json()
    if (!url || !isValidWebhookUrl(url)) {
        return NextResponse.json({ error: 'Please provide a valid HTTPS webhook URL' }, { status: 400 })
    }

    // Insert webhook linked to the company
    const { data, error } = await supabase
        .from('webhooks')
        .insert({
            company_id: profile.company_id,
            url,
            events: ['knowledge_gap', 'risk_assessment'],
            is_active: true,
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: 'Failed to save webhook' }, { status: 500 })
    return NextResponse.json({ webhook: data })
}