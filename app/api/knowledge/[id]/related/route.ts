import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

// GET /api/knowledge/[id]/related
// Finds knowledge items semantically similar to the given item using vector embeddings
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Next.js 15/16 requires params to be a Promise
) {
    try {
        // Authenticate the user
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Get the Supabase server client
        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        // params must be awaited in Next.js 15/16
        const { id } = await params
        const knowledgeId = id

        // Basic UUID format check — avoids sending a malformed value into
        // the database query and getting back a raw Postgres error
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
        if (!uuidRegex.test(knowledgeId)) {
            return NextResponse.json({ error: 'Invalid knowledge item id' }, { status: 400 })
        }

        // Fetch the embedding of the current knowledge item
        const { data: currentItem } = await supabase
            .from('employee_knowledge')
            .select('embedding, company_id')
            .eq('id', knowledgeId)
            .single()

        // If the item doesn't exist, return 404
        if (!currentItem) {
            return NextResponse.json({ error: 'Knowledge item not found' }, { status: 404 })
        }

        // 🔒 Security check: verify the user belongs to the same company as this item
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (profile?.company_id !== currentItem.company_id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // If the item has no embedding yet, there's nothing to compare — return an empty list
        if (!currentItem.embedding) {
            return NextResponse.json({ success: true, related: [] })
        }

        // Find similar documents using cosine similarity
        // Note: in PostgreSQL (pgvector), the <-> operator calculates cosine distance
        const { data: related, error } = await supabase.rpc('find_similar_knowledge', {
            query_embedding: currentItem.embedding,
            match_count: 5,
            company_id: currentItem.company_id,
            exclude_id: knowledgeId,
        })

        if (error) {
            console.error('[Related] RPC error:', error)
            // Don't leak the raw database error to the client
            return NextResponse.json({ error: 'Failed to find related knowledge' }, { status: 500 })
        }

        return NextResponse.json({ success: true, related: related || [] })
    } catch (err) {
        console.error('[Related] Error:', err)
        return NextResponse.json({ error: 'Failed to find related knowledge' }, { status: 500 })
    }
}