import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize Resend (Make sure to add RESEND_API_KEY to your .env.local)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { employeeId } = await req.json();
        if (!employeeId) return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });

        // 1. Fetch Employee Details
        const { data: employee, error: fetchError } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();

        if (fetchError || !employee) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // 2. Generate Secure Token (Valid for 14 days)
        const secureToken = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 14);

        // 3. Update Employee Record
        const { error: updateError } = await supabase
            .from('employees')
            .update({
                offboarding_status: 'offboarding',
                offboarding_token: secureToken,
                token_expires_at: expiresAt.toISOString()
            })
            .eq('id', employeeId);

        if (updateError) throw updateError;

        // 4. Send the Magic Link Email
        const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/offboard/${secureToken}`;

        const { data: emailData, error: emailError } = await resend.emails.send({
            from: 'VEQ Knowledge <onboarding@resend.dev>', // Replace with your verified domain later
            to: [employee.email], // Assuming your employees table has an 'email' column
            subject: `Action Required: Your VEQ Knowledge Handover for ${employee.name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e9ded0; border-radius: 12px;">
                    <h2 style="color: #3A2418; font-style: italic;">Hello ${employee.name},</h2>
                    <p style="color: #806B58; line-height: 1.6;">
                        As you prepare for your next adventure, we want to ensure your incredible contributions and knowledge are preserved for the team.
                    </p>
                    <p style="color: #806B58; line-height: 1.6;">
                        Please take <strong>10 minutes</strong> to fill out your personalized Exit Brain Dump. This helps us capture your processes, decisions, and hidden dependencies.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${magicLink}" style="background-color: #3A2418; color: #F4EDE1; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-family: monospace;">
                            Start My Knowledge Handover
                        </a>
                    </div>
                    <p style="color: #806B58; font-size: 12px; text-align: center;">
                        This secure link will expire in 14 days. Thank you for everything you've done for the team!
                    </p>
                </div>
            `
        });

        if (emailError) {
            console.error('Email send error:', emailError);
            // We still return success for the DB update, but log the email error
        }

        return NextResponse.json({
            success: true,
            message: `Offboarding triggered. Secure link sent to ${employee.email}.`,
            token: secureToken
        });

    } catch (error) {
        console.error('HR Offboard Trigger Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to trigger offboarding' }, { status: 500 });
    }
}