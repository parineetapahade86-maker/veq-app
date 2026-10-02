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
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Fetch all knowledge items with entities
        const { data: knowledgeItems } = await supabase
            .from('employee_knowledge')
            .select('id, source_reference, content, metadata, entities')
            .eq('company_id', profile.company_id)

        if (!knowledgeItems || knowledgeItems.length === 0) {
            return NextResponse.json({ nodes: [], edges: [] })
        }

        // Extract nodes and edges from entities
        const nodes: any[] = []
        const edges: any[] = []
        const nodeMap = new Map<string, boolean>()

        knowledgeItems.forEach((item, index) => {
            // Add document node
            const docId = `doc-${item.id}`
            if (!nodeMap.has(docId)) {
                nodes.push({
                    id: docId,
                    type: 'document',
                    data: {
                        label: item.source_reference || 'Untitled',
                        type: 'Document'
                    },
                    position: {
                        x: Math.random() * 800,
                        y: Math.random() * 600
                    },
                    style: {
                        background: '#C6A15B',
                        color: '#3A2418',
                        border: '2px solid #3A2418',
                        borderRadius: '8px',
                        padding: '10px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }
                })
                nodeMap.set(docId, true)
            }

            // Add entity nodes
            const entities = item.entities || []
            entities.forEach((entity: any) => {
                const entityId = `${entity.entity_type}-${entity.entity_value}`

                if (!nodeMap.has(entityId)) {
                    // Determine color based on entity type
                    let bgColor = '#F4EDE1'
                    let borderColor = '#806B58'

                    switch (entity.entity_type) {
                        case 'person':
                            bgColor = '#3B82F6'
                            borderColor = '#1E40AF'
                            break
                        case 'organization':
                            bgColor = '#8B5CF6'
                            borderColor = '#5B21B6'
                            break
                        case 'topic':
                            bgColor = '#10B981'
                            borderColor = '#047857'
                            break
                        case 'date':
                            bgColor = '#F59E0B'
                            borderColor = '#B45309'
                            break
                        case 'action_item':
                            bgColor = '#EF4444'
                            borderColor = '#B91C1C'
                            break
                    }

                    nodes.push({
                        id: entityId,
                        type: 'entity',
                        data: {
                            label: entity.entity_value,
                            type: entity.entity_type
                        },
                        position: {
                            x: Math.random() * 800,
                            y: Math.random() * 600
                        },
                        style: {
                            background: bgColor,
                            color: '#fff',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '20px',
                            padding: '8px 12px',
                            fontSize: '11px',
                            fontWeight: '600'
                        }
                    })
                    nodeMap.set(entityId, true)
                }

                // Create edge between document and entity
                edges.push({
                    id: `edge-${docId}-${entityId}`,
                    source: docId,
                    target: entityId,
                    animated: true,
                    style: { stroke: '#C6A15B', strokeWidth: 2 }
                })
            })
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
        console.error('Error fetching knowledge graph:', error)
        return NextResponse.json({ error: 'Failed to fetch graph' }, { status: 500 })
    }
}