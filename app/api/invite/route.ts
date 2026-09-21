// app/api/invite/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        // 🔒 Check the requester is logged in — otherwise anyone could hit
        // this endpoint and send invites for any company
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { email, companyName, companyId } = await request.json()
        if (!email || !companyId || !companyName) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

        // 🔒 Confirm the requester is actually the founder of THIS company —
        // otherwise anyone logged in could send invites into someone else's
        // company just by knowing (or guessing) their companyId
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id, role')
            .eq('id', user.id)
            .single()

        if (!profile || profile.role !== 'founder' || profile.company_id !== companyId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // 1. Generate a unique token — using a cryptographically secure
        // generator, since Math.random() is predictable and unsafe for
        // anything that acts like an access credential
        const token = crypto.randomBytes(24).toString('hex')

        // 2. Build the magic link
        // Note: in production, this will be your real domain; for now it's localhost
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const magicLink = `${baseUrl}/join/${token}`

        // 3. Save to the database
        const { error } = await supabase
            .from('employee_invites')
            .insert({
                company_id: companyId,
                employee_email: email,
                invite_token: token,
                status: 'pending',
            })

        if (error) throw error

        // 4. Send the email (via Resend)
        // Note: on the free tier, emails come from 'onboarding@resend.dev'
        const { error: emailError } = await resend.emails.send({
            from: 'VEQ Team <onboarding@resend.dev>',
            to: [email],
            subject: `You're invited to join ${companyName} on VEQ!`,
            html: `
        <h1>Welcome to ${companyName}!</h1>
        <p>You've been invited to join the team.</p>
        <p>Click the link below to join:</p>
        <a href="${magicLink}" style="background-color: #C6A15B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Join Team</a>
        <p>Or copy this link: ${magicLink}</p>
      `,
        })

        if (emailError) {
            // The invite was saved even though the email failed to send —
            // still tell the caller so they know to resend or share the link manually
            console.error('Email send error:', emailError)
            return NextResponse.json(
                { success: true, link: magicLink, emailSent: false, warning: 'Invite saved, but the email failed to send' },
                { status: 200 }
            )
        }

        return NextResponse.json({ success: true, link: magicLink, emailSent: true })
    } catch (error) {
        console.error('Invite Error:', error)
        return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
    }
}