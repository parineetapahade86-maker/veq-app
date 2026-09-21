import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function PUT(req: NextRequest) {
    try {
        const { videoId, title, userId } = await req.json()

        if (!videoId || !title || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data, error } = await supabase
            .from('videos')
            .update({
                title,
                metadata: {
                    edited_at: new Date().toISOString(),
                    edited_by: userId
                }
            })
            .eq('id', videoId)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Update failed' },
            { status: 500 }
        )
    }
}