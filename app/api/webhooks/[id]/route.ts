// app/api/webhooks/[id]/route.ts
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get the user's company_id
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', user.id)
        .single()

    if (!profile?.company_id) {
        return NextResponse.json({ error: 'Company profile not found' }, { status: 400 })
    }

    const { id } = await params

    // 🔒 SECURE DELETE: Only delete if the webhook belongs to THIS user's company
    const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', id)
        .eq('company_id', profile.company_id)

    if (error) return NextResponse.json({ error: 'Failed to delete webhook' }, { status: 500 })
    return NextResponse.json({ success: true })
}