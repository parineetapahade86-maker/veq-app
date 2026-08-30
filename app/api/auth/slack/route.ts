import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.SLACK_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/slack/callback`


    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=channels:history,channels:read,users:read,team:read&user_scope=users:read`

    return NextResponse.redirect(slackAuthUrl)
}