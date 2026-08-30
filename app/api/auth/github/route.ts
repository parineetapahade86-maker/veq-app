import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const clientId = process.env.GITHUB_CLIENT_ID

    const origin = request.nextUrl.origin
    const redirectUri = `${origin}/api/auth/github/callback`

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user,read:org`

    return NextResponse.redirect(githubAuthUrl)
}