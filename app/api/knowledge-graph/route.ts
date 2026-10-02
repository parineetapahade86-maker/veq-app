// app/api/knowledge-graph/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get user's company
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({
                nodes: [],
                edges: [],
                stats: { totalNodes: 0, totalEdges: 0, totalDocuments: 0 }
            })
        }

        // Fetch all knowledge items with entities
        const { data: knowledgeItems, error } = await supabase
            .from('employee_knowledge')
            .select('id, source_reference, content, metadata, entities, created_at')
            .eq('company_id', profile.company_id)
            .order('created_at', { ascending: false })

        console.log('Fetched knowledge items:', knowledgeItems?.length || 0)

        if (error || !knowledgeItems || knowledgeItems.length === 0) {
            console.log('No knowledge items found or error:', error)
            return NextResponse.json({
                nodes: [],
                edges: [],
                stats: { totalNodes: 0, totalEdges: 0, totalDocuments: 0 }
            })
        }

        // Build nodes and edges
        const nodes: any[] = []
        const edges: any[] = []
        const nodeMap = new Map<string, boolean>()
        let entityCount = 0

        // ✅ FALLBACK: Agar entities nahi hain, toh content se keywords nikalo
        const extractKeywords = (text: string): string[] => {
            if (!text) return []
            const words = text.split(/\s+/)
            const keywords: string[] = []
            const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'this', 'that', 'these', 'those', 'it', 'its'])

            words.forEach(word => {
                const clean = word.replace(/[^a-zA-Z0-9]/g, '')
                if (clean.length > 3 && !stopWords.has(clean.toLowerCase())) {
                    keywords.push(clean)
                }
            })

            // Return top 5 most frequent keywords
            const freq: Record<string, number> = {}
            keywords.forEach(k => { freq[k] = (freq[k] || 0) + 1 })
            return Object.entries(freq)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([word]) => word)
        }

        knowledgeItems.forEach((item, index) => {
            // Add document node (ALWAYS - this is the fallback!)
            const docId = `doc-${item.id}`
            if (!nodeMap.has(docId)) {
                nodes.push({
                    id: docId,
                    type: 'document',
                    data: {
                        label: item.source_reference || `Document ${index + 1}`,
                        type: 'Document'
                    },
                    position: {
                        x: 100 + (index % 4) * 220,
                        y: 100 + Math.floor(index / 4) * 180
                    },
                    style: {
                        background: '#C6A15B',
                        color: '#3A2418',
                        border: '2px solid #3A2418',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        minWidth: '140px',
                        textAlign: 'center'
                    }
                })
                nodeMap.set(docId, true)
            }

            // Try to get entities from database
            let entities = item.entities || []

            // ✅ FALLBACK: Agar entities array khaali hai, toh content se keywords nikalo
            if (entities.length === 0 && item.content) {
                const keywords = extractKeywords(item.content)
                entities = keywords.map(kw => ({
                    entity_type: 'topic',
                    entity_value: kw
                }))
                console.log(`Extracted ${keywords.length} keywords from: ${item.source_reference}`)
            }

            // Also try metadata tags
            if (entities.length === 0 && item.metadata?.tags) {
                entities = item.metadata.tags.map((tag: string) => ({
                    entity_type: 'topic',
                    entity_value: tag
                }))
            }

            // Add entity nodes
            entities.forEach((entity: any) => {
                const entityId = `${entity.entity_type}-${entity.entity_value}`

                if (!nodeMap.has(entityId)) {
                    let bgColor = '#E9DED0'
                    let borderColor = '#806B58'
                    let textColor = '#3A2418'

                    switch (entity.entity_type) {
                        case 'person':
                            bgColor = '#3B82F6'; borderColor = '#1E40AF'; textColor = '#fff'; break
                        case 'organization':
                            bgColor = '#8B5CF6'; borderColor = '#5B21B6'; textColor = '#fff'; break
                        case 'topic':
                            bgColor = '#10B981'; borderColor = '#047857'; textColor = '#fff'; break
                        case 'date':
                            bgColor = '#F59E0B'; borderColor = '#B45309'; textColor = '#fff'; break
                        case 'action_item':
                            bgColor = '#EF4444'; borderColor = '#B91C1C'; textColor = '#fff'; break
                    }

                    nodes.push({
                        id: entityId,
                        type: 'entity',
                        data: {
                            label: entity.entity_value,
                            type: entity.entity_type
                        },
                        position: {
                            x: 100 + Math.random() * 600,
                            y: 100 + Math.random() * 400
                        },
                        style: {
                            background: bgColor,
                            color: textColor,
                            border: `2px solid ${borderColor}`,
                            borderRadius: '20px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }
                    })
                    nodeMap.set(entityId, true)
                    entityCount++
                }

                // Create edge
                edges.push({
                    id: `edge-${docId}-${entityId}`,
                    source: docId,
                    target: entityId,
                    animated: true,
                    style: { stroke: '#C6A15B', strokeWidth: 2 }
                })
            })
        })

        console.log('✅ Graph built successfully:', {
            nodes: nodes.length,
            edges: edges.length,
            documents: knowledgeItems.length,
            entities: entityCount
        })

        return NextResponse.json({
            nodes,
            edges,
            stats: {
                totalNodes: nodes.length,
                totalEdges: edges.length,
                totalDocuments: knowledgeItems.length
            }
        })

    } catch (error) {
        console.error('❌ Error fetching knowledge graph:', error)
        return NextResponse.json({
            error: 'Failed to fetch graph',
            nodes: [],
            edges: [],
            stats: { totalNodes: 0, totalEdges: 0, totalDocuments: 0 }
        }, { status: 500 })
    }
}