import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = 'https://veq-app.vercel.app/api/auth/google/callback'

    // Google OAuth URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.readonly&access_type=offline&prompt=consent`

    return NextResponse.redirect(googleAuthUrl)
}