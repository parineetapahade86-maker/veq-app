import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.ASANA_CLIENT_ID
    const redirectUri = 'https://veq-app.vercel.app/api/auth/asana/callback'

    // ✅ ADDED: scope=default explicitly to avoid restricted scopes
    const asanaAuthUrl = `https://app.asana.com/-/oauth_authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=default`

    return NextResponse.redirect(asanaAuthUrl)
}