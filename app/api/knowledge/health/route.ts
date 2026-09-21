import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = getSupabase()
        if (!supabase) return NextResponse.json({ error: 'DB error' }, { status: 500 })

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 400 })
        }

        // Fetch all knowledge items and entities for this company
        const { data: knowledgeItems, error: kError } = await supabase
            .from('employee_knowledge')
            .select('id, created_at, source_type, metadata')
            .eq('company_id', profile.company_id)

        const { data: entities, error: eError } = await supabase
            .from('knowledge_entities')
            .select('entity_type, entity_value')
            .eq('company_id', profile.company_id)

        if (kError || eError) throw new Error('Failed to fetch data')

        const totalItems = knowledgeItems?.length || 0

        if (totalItems === 0) {
            return NextResponse.json({
                success: true,
                healthScore: 0,
                metrics: {
                    freshness: 0,
                    coverage: 0,
                    aiEnrichment: 0,
                    gaps: ["No knowledge items found yet. Start by uploading documents!"]
                }
            })
        }

        // 🧠 1. FRESHNESS SCORE (% of items created in last 90 days)
        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const recentItems = knowledgeItems.filter((item: any) =>
            new Date(item.created_at) >= ninetyDaysAgo
        ).length
        const freshnessScore = Math.round((recentItems / totalItems) * 100)

        // 🧠 2. COVERAGE SCORE (Number of unique topics)
        const topics = entities?.filter((e: any) => e.entity_type === 'topic') || []
        const uniqueTopics = new Set(topics.map((t: any) => t.entity_value.toLowerCase()))
        const coverageScore = Math.min(uniqueTopics.size * 5, 100) // Cap at 100 (20 unique topics = 100%)

        // 🧠 3. AI ENRICHMENT SCORE (% of items that have extracted metadata/entities)
        const enrichedItems = knowledgeItems.filter((item: any) =>
            item.metadata?.entities || item.metadata?.extracted
        ).length
        const enrichmentScore = Math.round((enrichedItems / totalItems) * 100)

        // 🧠 4. OVERALL HEALTH SCORE (Weighted Average)
        const overallHealthScore = Math.round(
            (freshnessScore * 0.3) + (coverageScore * 0.4) + (enrichmentScore * 0.3)
        )

        // 🧠 5. IDENTIFY GAPS
        const gaps = []
        if (freshnessScore < 50) gaps.push("Knowledge is getting stale. Encourage team to upload recent documents.")
        if (uniqueTopics.size < 5) gaps.push("Low topic coverage. Try uploading documents from different departments.")
        if (enrichmentScore < 70) gaps.push("Many documents lack AI extraction. Review upload settings.")
        if (gaps.length === 0) gaps.push("Excellent! Your knowledge base is healthy and well-maintained.")

        return NextResponse.json({
            success: true,
            healthScore: overallHealthScore,
            metrics: {
                freshness: freshnessScore,
                coverage: uniqueTopics.size,
                aiEnrichment: enrichmentScore,
                gaps: gaps,
                totalItems: totalItems,
                uniqueTopicsList: Array.from(uniqueTopics).slice(0, 10) // Top 10 topics
            }
        })

    } catch (error: any) {
        console.error('[Health API] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}