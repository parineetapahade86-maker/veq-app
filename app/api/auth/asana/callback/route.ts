import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const origin = request.nextUrl.origin

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=asana_auth_failed', origin))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const redirectUri = `${origin}/api/auth/asana/callback`

        // Exchange code for access token
        const tokenResponse = await fetch('https://app.asana.com/-/oauth_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: process.env.ASANA_CLIENT_ID!,
                client_secret: process.env.ASANA_CLIENT_SECRET!,
                code: code,
                redirect_uri: redirectUri
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
                provider: 'asana',
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
        return NextResponse.redirect(new URL('/dashboard/plugins?success=asana_connected', origin))

    } catch (error) {
        console.error('Asana OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=asana_auth_failed', origin))
    }
}