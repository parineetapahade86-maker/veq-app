import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        // 1. Check the user is logged in (via Clerk, not Supabase Auth)
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()

        if (!body.companyName || !body.founderName || !body.companyEmail) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabase = getSupabase()
        if (!supabase) {
            console.error('Supabase client not configured — check env vars')
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
        }

        // 2. Generate the company ID on the server — never trust one sent from the client
        const companyId = `VEQ-${crypto.randomBytes(4).toString('hex').toUpperCase()}`

        // 3. Create the company
        const { data: company, error: companyError } = await supabase
            .from('companies')
            .insert({
                company_name: body.companyName,
                location: body.location,
                founder_name: body.founderName,
                company_email: body.companyEmail,
                what_they_do: body.whatTheyDo,
                total_employees: parseInt(body.totalEmployees) || 0,
                company_id: companyId,
            })
            .select()
            .single()

        if (companyError) throw companyError

        // 4. Add the founder to user_profiles (using their Clerk user ID)
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress ?? '',
                role: 'founder',
                company_id: company.id,
            })

        if (profileError) throw profileError

        // 5. Create employee invites
        const employeeEmails: string[] = body.employeeEmails || []
        const invites: { email: string; inviteLink: string }[] = []

        for (const email of employeeEmails) {
            if (!email) continue

            // Use a cryptographically secure token, not Math.random()
            // (Math.random() is predictable and not safe for anything
            // resembling an access credential, like an invite link)
            const inviteToken = crypto.randomBytes(20).toString('hex')
            const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${inviteToken}`

            const { error: inviteError } = await supabase
                .from('employee_invites')
                .insert({
                    company_id: company.id,
                    employee_email: email,
                    invite_token: inviteToken,
                    invite_link: inviteLink,
                })
                .select()
                .single()

            if (inviteError) {
                console.error(`Failed to create invite for ${email}:`, inviteError.message)
                continue
            }

            invites.push({ email, inviteLink })

            // TODO: Send email (via Resend/SendGrid)
            // await sendEmail({
            //   to: email,
            //   subject: `Join ${body.companyName} on VEQ`,
            //   text: `Click here to join: ${inviteLink}`,
            // })
        }

        return NextResponse.json({
            success: true,
            company,
            companyId,
            invites,
        })
    } catch (error) {
        console.error('Error:', error)
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
    }
}