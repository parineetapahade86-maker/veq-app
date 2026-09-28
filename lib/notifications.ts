// lib/notifications.ts
import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'

// Initialize Resend for Emails 
const resend = new Resend(process.env.RESEND_API_KEY)

// ==========================================
// 1. IN-APP NOTIFICATIONS 
// ==========================================
export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string
) {
    const supabase = await createClient()

    await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
        link: link || null,
        is_read: false
    })
}

// ==========================================
// 2. EXTERNAL ALERTS: SLACK & EMAIL (New Additions)
// ==========================================

// Slack Alert Function
export async function sendSlackAlert(webhookUrl: string, message: string) {
    if (!webhookUrl) return;

    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `🔔 *VEQ Alert* \n${message}`
            })
        });
        console.log('Slack alert sent successfully!');
    } catch (error) {
        console.error('Failed to send Slack alert:', error);
    }
}

// Email Alert Function
export async function sendEmailAlert(toEmail: string, subject: string, htmlContent: string) {
    if (!toEmail || !process.env.RESEND_API_KEY) return;

    try {
        await resend.emails.send({
            from: 'VEQ Alerts <alerts@veq.app>',
            to: toEmail,
            subject: subject,
            html: htmlContent
        });
        console.log('Email alert sent successfully!');
    } catch (error) {
        console.error('Failed to send email alert:', error);
    }
}

// Master Trigger Function 
export async function triggerEventNotification(
    companyId: string,
    eventType: 'document_added' | 'employee_offboarded',
    details: string,
    founderEmail: string,
    slackWebhookUrl?: string
) {
    // Slack Message Format
    let slackMsg = "";
    let emailSub = "";
    let emailHtml = "";

    if (eventType === 'document_added') {
        slackMsg = `📄 *New Knowledge Captured!* \n${details}`;
        emailSub = "VEQ: New Document Added to Vault";
        emailHtml = `<h3>📄 New Knowledge Captured!</h3><p>${details}</p><p>Keep building that organizational brain!</p>`;
    } else if (eventType === 'employee_offboarded') {
        slackMsg = `⚠️ *Offboarding Alert!* \n${details} \nPlease ensure their knowledge is transferred.`;
        emailSub = "VEQ: Critical Offboarding Alert";
        emailHtml = `<h3>⚠️ Employee Offboarding Initiated</h3><p>${details}</p><p><strong>Action Required:</strong> Please review their Knowledge Handover Score and assign a reverse handover task.</p>`;
    }

    // Fire both asynchronously (Don't block the main app)
    if (slackWebhookUrl) sendSlackAlert(slackWebhookUrl, slackMsg);
    sendEmailAlert(founderEmail, emailSub, emailHtml);
}