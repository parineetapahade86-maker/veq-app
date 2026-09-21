import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const clientId = process.env.LINEAR_CLIENT_ID
  const origin = request.nextUrl.origin
  const redirectUri = `${origin}/api/auth/linear/callback`

  // ✅ CORRECTED: linear.app instead of auth.linear.app
  const linearAuthUrl = `https://linear.app/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=read,write`

  return NextResponse.redirect(linearAuthUrl)
}