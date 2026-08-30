import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const origin = request.nextUrl.origin

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=zendesk_auth_failed', origin))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const subdomain = process.env.ZENDESK_SUBDOMAIN
        const redirectUri = `${origin}/api/auth/zendesk/callback`

        // Exchange code for access token
        const tokenResponse = await fetch(`https://${subdomain}.zendesk.com/oauth/tokens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                code: code,
                client_id: process.env.ZENDESK_CLIENT_ID,
                client_secret: process.env.ZENDESK_CLIENT_SECRET,
                redirect_uri: redirectUri,
                scope: 'read'
            })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error_description || 'Failed to get token')
        }

        // Get current user
        const user = await currentUser()
        if (!user) {
            return NextResponse.redirect(new URL('/sign-in', origin))
        }

        // Save to Supabase
        const supabase = await createClient()
        const { error: insertError } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                provider: 'zendesk',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
            }, {
                onConflict: 'user_id,provider'
            })

        if (insertError) {
            console.error('Supabase insert error:', insertError)
            throw insertError
        }

        // Success!
        return NextResponse.redirect(new URL('/dashboard/plugins?success=zendesk_connected', origin))

    } catch (error) {
        console.error('Zendesk OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=zendesk_auth_failed', origin))
    }
}