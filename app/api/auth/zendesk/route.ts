import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const clientId = process.env.ZENDESK_CLIENT_ID
    const subdomain = process.env.ZENDESK_SUBDOMAIN
    const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
    const redirectUri = `${origin}/api/auth/zendesk/callback`

    // Scopes - Zendesk specific format
    const scopes = 'tickets:read users:read organizations:read'

    // Zendesk OAuth URL
    const zendeskAuthUrl = `https://${subdomain}.zendesk.com/oauth/authorizations/new?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`

    return NextResponse.redirect(zendeskAuthUrl)
}