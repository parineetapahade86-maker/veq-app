import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const origin = request.nextUrl.origin

    console.log('Slack callback received:', { code, error })

    if (error) {
        console.error('Slack error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=slack_auth_failed', origin))
    }

    if (!code) {
        console.error('No code received')
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const redirectUri = `${origin}/api/auth/slack/callback`
        const clientId = process.env.SLACK_CLIENT_ID
        const clientSecret = process.env.SLACK_CLIENT_SECRET

        console.log('Exchanging code for token...', { clientId, redirectUri })

        // Exchange code for access token
        const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId!,
                client_secret: clientSecret!,
                code: code,
                redirect_uri: redirectUri
            })
        })

        const tokenData = await tokenResponse.json()
        console.log('Token response:', tokenData)

        if (!tokenData.ok) {
            console.error('Slack API error:', tokenData.error)
            throw new Error(tokenData.error || 'Failed to get token')
        }

        // Get current user from Clerk
        const user = await currentUser()
        if (!user) {
            console.error('No user found')
            return NextResponse.redirect(new URL('/sign-in', origin))
        }

        // Save to Supabase
        const supabase = await createClient()
        const { error: insertError } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                provider: 'slack',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
            }, {
                onConflict: 'user_id,provider'
            })

        if (insertError) {
            console.error('Supabase error:', insertError)
            throw insertError
        }

        console.log('Slack connected successfully!')
        return NextResponse.redirect(new URL('/dashboard/plugins?success=slack_connected', origin))

    } catch (error) {
        console.error('Slack OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=slack_auth_failed', origin))
    }
}