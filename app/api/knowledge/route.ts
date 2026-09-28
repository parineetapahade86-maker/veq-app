// app/api/knowledge/route.ts
import { triggerEventNotification } from '@/lib/notifications';
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

    // ✅ ACTIVE ASSISTANT NOTIFICATION: Trigger Slack & Email alerts
    try {
        // Fetch founder's email from the same company
        const { data: founderProfile } = await supabase
            .from('user_profiles')
            .select('email')
            .eq('company_id', profile.company_id)
            .eq('role', 'founder')
            .single()

        // Fetch company Slack webhook (if exists)
        const { data: companySettings } = await supabase
            .from('company_settings')
            .select('slack_webhook_url')
            .eq('company_id', profile.company_id)
            .single()

        const founderEmail = founderProfile?.email || 'founder@veq.app'
        const companySlackWebhook = companySettings?.slack_webhook_url || null

        // Fire notification asynchronously (won't block the response)
        triggerEventNotification(
            profile.company_id,
            'document_added',
            `"${title || 'Untitled Document'}" was added by ${user.firstName || user.id}.`,
            founderEmail,
            companySlackWebhook
        )
    } catch (notifError) {
        // Silently fail if notification fails - document was still saved successfully
        console.error('Notification trigger failed:', notifError)
    }

    return NextResponse.json({ success: true, data })
}