import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.ZOOM_CLIENT_ID
    const redirectUri = 'https://veq-app.vercel.app/api/auth/zoom/callback'

    // Zoom OAuth URL
    const zoomAuthUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`

    return NextResponse.redirect(zoomAuthUrl)
}