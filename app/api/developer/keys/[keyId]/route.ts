// app/api/developer/keys/[keyId]/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function DELETE(req: Request, { params }: { params: { keyId: string } }) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    const { keyId } = params

    // Soft delete (Mark as inactive instead of deleting)
    const { error } = await supabase.from('api_keys').update({ is_active: false }).eq('id', keyId)
    if (error) return NextResponse.json({ error: 'Failed to revoke key' }, { status: 500 })

    return NextResponse.json({ success: true })
}