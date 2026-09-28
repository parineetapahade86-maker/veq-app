// app/api/cron/weekly-report/route.ts
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    console.log("⏰ Cron Job Triggered: Generating Weekly Reports...")

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    // 1. Get all companies
    const { data: companies } = await supabase.from('companies').select('id, name')
    if (!companies) return NextResponse.json({ message: 'No companies' })

    for (const company of companies) {
        // 2. Count last week's activity
        const { count: tasksCount } = await supabase
            .from('tasks').select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        const { count: meetingsCount } = await supabase
            .from('meetings').select('*', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

        console.log(`📧 Sending report to ${company.name}: ${tasksCount} tasks, ${meetingsCount} meetings.`)
        // TODO: Integrate Resend/SendGrid here to actually send the email!
    }

    return NextResponse.json({ success: true, message: 'Reports processed' })
}