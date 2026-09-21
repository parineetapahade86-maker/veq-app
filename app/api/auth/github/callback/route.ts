import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Dynamic origin for safe redirect back to dashboard
    const origin = request.nextUrl.origin

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=github_auth_failed', origin))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const redirectUri = `${origin}/api/auth/github/callback`

        // Exchange code for access token
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code,
                redirect_uri: redirectUri // Dynamic URL yahan bhi use hoga
            })
        })

        const tokenData = await tokenResponse.json()

        if (tokenData.error) {
            throw new Error(tokenData.error_description || 'Failed to get token')
        }

        const user = await currentUser()
        if (!user) {
            return NextResponse.redirect(new URL('/sign-in', origin))
        }

        const supabase = await createClient()
        const { error: insertError } = await supabase
            .from('user_integrations')
            .upsert({
                user_id: user.id,
                provider: 'github',
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || null,
                token_expires_at: null,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,provider'
            })

        if (insertError) {
            console.error('Supabase insert error:', insertError)
            throw insertError
        }

        // Success redirect (Dynamic origin)
        return NextResponse.redirect(new URL('/dashboard/plugins?success=github_connected', origin))

    } catch (error) {
        console.error('GitHub OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=github_auth_failed', origin))
    }
}