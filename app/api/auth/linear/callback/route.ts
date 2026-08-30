import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const origin = request.nextUrl.origin

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=linear_auth_failed', origin))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const redirectUri = `${origin}/api/auth/linear/callback`

        // ✅ CORRECTED: linear.app instead of auth.linear.app
        const tokenResponse = await fetch('https://linear.app/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: process.env.LINEAR_CLIENT_ID,
                client_secret: process.env.LINEAR_CLIENT_SECRET,
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
                provider: 'linear',
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
        return NextResponse.redirect(new URL('/dashboard/plugins?success=linear_connected', origin))

    } catch (error) {
        console.error('Linear OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=linear_auth_failed', origin))
    }
}