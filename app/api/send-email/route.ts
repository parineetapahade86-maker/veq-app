import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    // 🔒 Require a logged-in user — without this, anyone could use this
    // endpoint to send emails from your Resend account
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, subject, content, employeeName } = await req.json();

    if (!to || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: 'Invalid recipient email' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // 🔒 Confirm the recipient is actually an employee of this user's company —
    // otherwise this route could be used to email anyone
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'No company found for this user' }, { status: 400 });
    }

    const { data: recipient } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', profile.company_id)
      .eq('email', to)
      .single();

    if (!recipient) {
      return NextResponse.json({ error: 'Recipient is not an employee in your company' }, { status: 403 });
    }

    // The sender's own email, taken from their authenticated Clerk account —
    // not from the request body, which a caller could fake
    const senderEmail = user.emailAddresses[0]?.emailAddress ?? '';

    const { data, error } = await resend.emails.send({
      // NOTE: the "from" address must be on a domain verified in Resend.
      // You can't send as an arbitrary company address (hr@theircompany.com)
      // without verifying that domain — so send from your own verified
      // domain and set reply_to so replies still reach the HR person.
      from: 'VEQ Assistant <onboarding@resend.dev>',
      replyTo: senderEmail,
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #3A2418;">${subject}</h2>
          <p style="color: #806B58; line-height: 1.6;">${content}</p>

          <div style="margin-top: 30px; padding: 20px; background: #F4EDE1; border-radius: 8px; border-left: 4px solid #C6A15B;">
            <p style="margin: 0; font-size: 14px; color: #806B58;">
              This is an automated message from <strong>VEQ - The Knowledge Continuity Platform</strong><br/>
              <em>Reply directly to this email to reach your HR team.</em>
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Email API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}