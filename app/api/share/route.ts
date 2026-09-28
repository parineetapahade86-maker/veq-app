// app/api/share/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = await createClient()
        const { knowledgeId } = await req.json()

        if (!knowledgeId) {
            return NextResponse.json({ error: 'Knowledge ID is required' }, { status: 400 })
        }

        // Get company_id for this knowledge item
        const { data: knowledge } = await supabase
            .from('employee_knowledge')
            .select('company_id')
            .eq('id', knowledgeId)
            .single()

        if (!knowledge) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 })
        }

        // Generate a secure random token
        const token = randomUUID().replace(/-/g, '') // Removes dashes for a cleaner URL

        // Save to database
        const { error } = await supabase.from('shared_links').insert({
            knowledge_id: knowledgeId,
            company_id: knowledge.company_id,
            token: token,
            created_by: userId
        })

        if (error) {
            console.error('Share Link DB Error:', error)
            return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 })
        }

        // Return the full public URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        return NextResponse.json({
            success: true,
            shareUrl: `${baseUrl}/share/${token}`
        })

    } catch (error) {
        console.error('Share API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}