import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const origin = request.nextUrl.origin

    if (error) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=notion_auth_failed', origin))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/dashboard/plugins?error=no_code', origin))
    }

    try {
        const redirectUri = `${origin}/api/auth/notion/callback`

        // Exchange code for access token
        const tokenResponse = await fetch('https://api.notion.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`).toString('base64'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
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
                provider: 'notion',
                access_token: tokenData.access_token,
                workspace_id: tokenData.workspace_id || null,
                workspace_name: tokenData.workspace_name || null,
            }, {
                onConflict: 'user_id,provider'
            })

        if (insertError) {
            console.error('Supabase insert error:', insertError)
            throw insertError
        }

        // Success!
        return NextResponse.redirect(new URL('/dashboard/plugins?success=notion_connected', origin))

    } catch (error) {
        console.error('Notion OAuth error:', error)
        return NextResponse.redirect(new URL('/dashboard/plugins?error=notion_auth_failed', origin))
    }
}