import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmailNotification(
    to: string,
    subject: string,
    html: string
) {
    try {
        const data = await resend.emails.send({
            from: 'VEQ <notifications@veq-app.vercel.app>',
            to: [to],
            subject,
            html
        })
        return data
    } catch (error) {
        console.error('Email send error:', error)
        throw error
    }
}