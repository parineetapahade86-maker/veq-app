import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.JIRA_CLIENT_ID
    const redirectUri = 'https://veq-app.vercel.app/api/auth/jira/callback'

    // Jira (Atlassian) OAuth URL
    const jiraAuthUrl = `https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=${clientId}&scope=read%3Ajira-work%20write%3Ajira-work%20read%3Ame&redirect_uri=${encodeURIComponent(redirectUri)}&state=&response_type=code&prompt=consent`

    return NextResponse.redirect(jiraAuthUrl)
}