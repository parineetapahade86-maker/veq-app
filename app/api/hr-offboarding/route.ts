// app/api/hr-offboarding/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'
import { triggerEventNotification } from '@/lib/notifications'

export async function POST(req: Request) {
    try {
        // 1. AUTHENTICATION
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = await createClient()

        // 2. GET COMPANY & FOUNDER DETAILS
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id, role, email')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Security Check: Only founders can initiate offboarding alerts
        if (profile.role !== 'founder') {
            return NextResponse.json({ error: 'Only founders can initiate offboarding alerts' }, { status: 403 })
        }

        // 3. PARSE REQUEST BODY
        const body = await req.json()
        const { employeeId, employeeName, knowledgeScore } = body

        if (!employeeId || !employeeName) {
            return NextResponse.json({ error: 'Employee details required' }, { status: 400 })
        }

        // 4. UPDATE EMPLOYEE STATUS IN DATABASE 
        // (Optional: Uncomment the block below if you have an 'employees' table)
        // const { error: updateError } = await supabase
        //     .from('employees')
        //     .update({ status: 'offboarding' })
        //     .eq('id', employeeId)
        // if (updateError) console.error('DB Update Error:', updateError)

        // 5. FETCH COMPANY SETTINGS (Slack Webhook & Founder Email)
        // Note: If company_settings table doesn't exist, it gracefully falls back to profile.email
        const { data: companySettings } = await supabase
            .from('company_settings')
            .select('slack_webhook_url')
            .eq('company_id', profile.company_id)
            .single()

        const slackWebhook = companySettings?.slack_webhook_url || null
        const founderEmail = profile.email || 'founder@veq.app'

        // 6. 🔥 TRIGGER THE ACTIVE ASSISTANT NOTIFICATION!
        const alertDetails = `Employee **${employeeName}** (ID: ${employeeId}) has been marked for offboarding. Current Knowledge Continuity Score: **${knowledgeScore || 'N/A'}%**. Please initiate the Exit Brain Dump process immediately.`

        // Fire asynchronously in the background so it doesn't block the main API response
        triggerEventNotification(
            profile.company_id,
            'employee_offboarded',
            alertDetails,
            founderEmail,
            slackWebhook
        )

        // 7. RETURN SUCCESS
        return NextResponse.json({
            success: true,
            message: `Offboarding initiated for ${employeeName}. Alerts sent to Founder.`
        })

    } catch (error) {
        console.error('HR Offboarding API Error:', error)
        return NextResponse.json(
            { error: 'Failed to process offboarding request' },
            { status: 500 }
        )
    }
}