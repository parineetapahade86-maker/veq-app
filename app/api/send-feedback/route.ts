import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();

        const { data, error } = await resend.emails.send({
            from: 'VEQ Feedback <onboarding@resend.dev>',
            to: ['parineetapahade86@gmail.com'], // ✅ TUMHARA EMAIL YAHAN HAI!
            subject: `New VEQ Feedback from ${name || 'Anonymous'}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; background-color: #F4EDE1; border-radius: 8px;">
          <h2 style="color: #3A2418; margin-top: 0;">🚀 New VEQ Feedback</h2>
          <div style="background: #ffffff; padding: 20px; border-radius: 8px; border-left: 4px solid #C6A15B;">
            <p style="margin: 0 0 10px 0;"><strong style="color: #806B58;">Name:</strong> ${name || 'Not provided'}</p>
            <p style="margin: 0 0 10px 0;"><strong style="color: #806B58;">Email:</strong> ${email || 'Not provided'}</p>
            <p style="margin: 0 0 10px 0;"><strong style="color: #806B58;">Message:</strong></p>
            <p style="white-space: pre-line; color: #3A2418; line-height: 1.6;">${message}</p>
          </div>
          <p style="font-size: 12px; color: #806B58; margin-top: 20px; text-align: center;">
            Sent via VEQ - The Knowledge Continuity Platform
          </p>
        </div>
      `,
        });

        if (error) {
            console.error('Feedback send error:', error);
            return NextResponse.json({ error: 'Failed to send feedback' }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (err) {
        console.error('Feedback API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}