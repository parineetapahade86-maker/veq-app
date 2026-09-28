// app/api/developer/keys/[keyId]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ keyId: string }> }
) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    // params must be awaited in Next.js 14+
    const { keyId } = await params

    // Basic UUID format check — rejects malformed ids before they reach the database
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(keyId)) {
        return NextResponse.json({ error: 'Invalid key id' }, { status: 400 })
    }

    // 🔒 Only a founder can revoke API keys, and only for their own company
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id, role')
        .eq('id', userId)
        .single()

    if (!profile?.company_id || profile.role !== 'founder') {
        return NextResponse.json({ error: 'Forbidden — founders only' }, { status: 403 })
    }

    // 🔒 Scope the update to this company's own keys, and use .select() so
    // we can tell whether a row was actually revoked
    const { data, error } = await supabase
        .from('api_keys')
        .update({ is_active: false }) // soft-revoke keeps an audit trail (better than deleting)
        .eq('id', keyId)
        .eq('company_id', profile.company_id)
        .select('id')

    if (error) {
        console.error('Revoke key error:', error)
        return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 })
    }

    // Nothing matched: either the key doesn't exist or it belongs to another company.
    // Return the same 404 for both so we don't reveal which keys exist elsewhere.
    if (!data || data.length === 0) {
        return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
}