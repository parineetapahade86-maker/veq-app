import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

    const { error } = await supabase
        .from('employee_knowledge')
        .delete()
        .eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
}