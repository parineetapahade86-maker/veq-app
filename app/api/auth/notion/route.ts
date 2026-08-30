import { NextResponse } from 'next/server'

export async function GET() {
    const clientId = process.env.NOTION_CLIENT_ID
    const redirectUri = 'https://veq-app.vercel.app/api/auth/notion/callback'

    // Notion OAuth URL
    const notionAuthUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&owner=user`

    return NextResponse.redirect(notionAuthUrl)
}