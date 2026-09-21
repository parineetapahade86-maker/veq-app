// app/api/exit-braindump/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import { Resend } from 'resend'

// Initialize Resend with your API key from .env.local
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const user = await currentUser()
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()

        // ✅ Extract manager_email from the request body
        const { day1_projects, day2_contacts, day3_processes, day4_problems, day5_advice, manager_email } = body

        if (!day1_projects || !day2_contacts || !day3_processes || !day4_problems || !day5_advice) {
            return NextResponse.json({ error: 'Please complete all steps before submitting' }, { status: 400 })
        }

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'No company found for this user' }, { status: 400 })
        }

        // Save each answer as its own searchable knowledge entry
        const entries = [
            { title: 'Key Projects & Access', content: day1_projects },
            { title: 'Important Contacts', content: day2_contacts },
            { title: 'Hidden Processes & SOPs', content: day3_processes },
            { title: 'Common Problems & Fixes', content: day4_problems },
            { title: 'Advice for Successor', content: day5_advice },
        ]

        const rows = entries.map((entry) => ({
            employee_id: user.id,
            company_id: profile.company_id,
            content: entry.content,
            source_type: 'exit_interview',
            source_reference: entry.title,
            metadata: { tags: ['exit-interview', 'brain-dump'], completed_at: new Date().toISOString() },
        }))

        const { error } = await supabase.from('employee_knowledge').insert(rows)

        if (error) {
            console.error('Exit brain dump insert error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // 📧 DYNAMIC AUTOMATED EMAIL TO MANAGER
        const recipientEmail = manager_email || process.env.MANAGER_EMAIL

        if (recipientEmail && recipientEmail.trim() !== '') {
            const employeeName = user.fullName || user.emailAddresses?.[0]?.emailAddress || 'An Employee'

            await resend.emails.send({
                from: 'VEQ Knowledge System <onboarding@resend.dev>', // Update with your verified Resend domain in production
                to: [recipientEmail], // ✅ Uses the dynamic email provided by the user
                subject: `🚨 Action Required: Knowledge Transfer Report for ${employeeName}`,
                html: `
                    <div style="font-family: Arial, sans-serif; color: #3A2418; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #3A2418;">Knowledge Transfer Completed</h2>
                        <p>Hi Manager,</p>
                        <p><strong>${employeeName}</strong> has successfully completed their Exit Brain Dump.</p>
                        <p>Their critical knowledge has been securely saved to the VEQ AI Knowledge Base and is now fully searchable by the team.</p>
                        
                        <h3 style="margin-top: 24px; color: #3A2418;">Quick Summary:</h3>
                        <ul style="line-height: 1.6;">
                            <li><strong>Projects:</strong> ${day1_projects ? 'Provided' : 'Not Provided'}</li>
                            <li><strong>Key Contacts:</strong> ${day2_contacts ? 'Provided' : 'Not Provided'}</li>
                            <li><strong>Hidden Processes:</strong> ${day3_processes ? 'Provided' : 'Not Provided'}</li>
                            <li><strong>Common Fixes:</strong> ${day4_problems ? 'Provided' : 'Not Provided'}</li>
                            <li><strong>Successor Advice:</strong> ${day5_advice ? 'Provided' : 'Not Provided'}</li>
                        </ul>
                        
                        <p style="margin-top: 24px;">Please log in to the VEQ Dashboard to review the full report and download the official PDF checklist.</p>
                        <br>
                        <p style="color: #806B58; font-size: 12px; border-top: 1px solid #E9DED0; padding-top: 16px;">Powered by VEQ AI Knowledge Management</p>
                    </div>
                `
            })
            console.log(`✅ Email sent successfully to: ${recipientEmail}`)
        } else {
            console.log('ℹ️ No manager email provided. Report saved to dashboard only.')
        }

        return NextResponse.json({
            success: true,
            message: 'Report saved and manager notified.'
        })

    } catch (error: any) {
        console.error('🚨 EXIT BRAIN DUMP API ERROR:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}