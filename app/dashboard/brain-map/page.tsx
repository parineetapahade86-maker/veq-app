// app/dashboard/brain-map/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from "reactflow"
import "reactflow/dist/style.css"
import { Brain, Network } from "lucide-react"

// Direct Supabase connection (same as Knowledge Vault uses)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function BrainMapPage() {
    const { user } = useUser()
    const [nodes, setNodes] = useNodesState([])
    const [edges, setEdges] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, totalDocuments: 0 })

    useEffect(() => {
        if (user) {
            fetchGraphData()
        }
    }, [user])

    const fetchGraphData = async () => {
        try {
            console.log(' Starting graph fetch...')

            // Step 1: Get company_id
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('company_id')
                .eq('id', user?.id)
                .single()

            console.log(' Profile:', profile)

            if (!profile?.company_id) {
                console.log('❌ No company_id found')
                setLoading(false)
                return
            }

            // Step 2: Fetch ALL knowledge items
            const { data: items, error } = await supabase
                .from('employee_knowledge')
                .select('*')
                .eq('company_id', profile.company_id)

            console.log('📄 Items found:', items?.length || 0)
            console.log('❌ Error:', error)

            if (error || !items || items.length === 0) {
                console.log('❌ No items or error')
                setLoading(false)
                return
            }

            // Step 3: Build nodes and edges
            const newNodes: any[] = []
            const newEdges: any[] = []

            items.forEach((item: any, index: number) => {
                // Create a node for each document
                const nodeId = `doc-${item.id}`

                newNodes.push({
                    id: nodeId,
                    type: 'default',
                    position: {
                        x: 150 + (index % 3) * 280,
                        y: 150 + Math.floor(index / 3) * 200
                    },
                    data: {
                        label: (
                            <div className="text-center">
                                <div className="font-bold text-sm text-[#3A2418]">
                                    {item.source_reference || `Document ${index + 1}`}
                                </div>
                            </div>
                        )
                    },
                    style: {
                        background: '#C6A15B',
                        color: '#3A2418',
                        border: '2px solid #3A2418',
                        borderRadius: '8px',
                        padding: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        minWidth: '160px',
                        textAlign: 'center'
                    }
                })

                // Connect documents to each other
                if (index > 0) {
                    newEdges.push({
                        id: `edge-${index}`,
                        source: `doc-${items[index - 1].id}`,
                        target: nodeId,
                        animated: true,
                        style: { stroke: '#C6A15B', strokeWidth: 2 }
                    })
                }

                // Also try to extract entities if they exist
                const entities = item.entities || []
                entities.forEach((entity: any) => {
                    const entityId = `${entity.entity_type}-${entity.entity_value}`

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

                    newNodes.push({
                        id: entityId,
                        type: 'default',
                        position: {
                            x: 100 + Math.random() * 600,
                            y: 100 + Math.random() * 400
                        },
                        data: {
                            label: (
                                <div className="text-center">
                                    <div className="font-semibold text-xs text-white">
                                        {entity.entity_value}
                                    </div>
                                    <div className="text-[9px] opacity-75 uppercase">
                                        {entity.entity_type}
                                    </div>
                                </div>
                            )
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

                    newEdges.push({
                        id: `edge-${nodeId}-${entityId}`,
                        source: nodeId,
                        target: entityId,
                        animated: true,
                        style: { stroke: '#C6A15B', strokeWidth: 2 }
                    })
                })
            })

            console.log('✅ Graph built:', {
                nodes: newNodes.length,
                edges: newEdges.length,
                documents: items.length
            })

            setNodes(newNodes)
            setEdges(newEdges)
            setStats({
                totalNodes: newNodes.length,
                totalEdges: newEdges.length,
                totalDocuments: items.length
            })

        } catch (error) {
            console.error('❌ Error fetching graph:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="text-center">
                        <Network className="w-16 h-16 text-[#C6A15B] mx-auto mb-4 animate-pulse" />
                        <p className="text-[#3A2418] font-display text-2xl italic mb-2">Mapping Organizational Brain...</p>
                        <p className="text-[#806B58] font-mono text-sm">Scanning Knowledge Vault for entities and connections.</p>
                    </div>
                </div>
            </section>
        )
    }

    if (nodes.length === 0) {
        return (
            <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
                    Intelligence · Memory Graph
                </p>
                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                    Company Brain Map
                </h1>
                <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center mt-8 bg-[#F4EDE1]/20">
                    <Brain className="w-16 h-16 text-[#806B58] mx-auto mb-4 opacity-50" />
                    <p className="text-[#3A2418] font-display text-2xl italic mb-2">
                        The Brain is Empty
                    </p>
                    <p className="text-sm text-[#806B58] max-w-md mx-auto">
                        No nodes found yet. Go to the <strong>Continuity Vault</strong> to upload documents, and the AI will automatically build this graph!
                    </p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-2">
                        Intelligence · Memory Graph
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic">
                        Company Brain Map
                    </h1>
                </div>
                <div className="flex gap-6 text-right">
                    <div>
                        <p className="text-3xl font-display text-[#3A2418]">{stats.totalNodes}</p>
                        <p className="text-xs font-mono text-[#806B58] uppercase">Nodes</p>
                    </div>
                    <div>
                        <p className="text-3xl font-display text-[#3A2418]">{stats.totalEdges}</p>
                        <p className="text-xs font-mono text-[#806B58] uppercase">Connections</p>
                    </div>
                    <div>
                        <p className="text-3xl font-display text-[#3A2418]">{stats.totalDocuments}</p>
                        <p className="text-xs font-mono text-[#806B58] uppercase">Sources</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 h-[700px] shadow-sm overflow-hidden relative">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    attributionPosition="bottom-left"
                    className="bg-[#F4EDE1]/40"
                >
                    <Background color="#C6A15B" gap={20} size={1} />
                    <Controls className="!bg-white !border-[#E9DED0] !rounded-lg !shadow-sm" />
                    <MiniMap
                        nodeColor={(node) => {
                            if (node.style?.background === '#C6A15B') return '#C6A15B'
                            return '#806B58'
                        }}
                        maskColor="rgba(58, 36, 24, 0.1)"
                        className="!bg-[#F4EDE1] !border-[#E9DED0] !rounded-lg"
                    />
                </ReactFlow>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#C6A15B] border-2 border-[#3A2418]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Document</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#3B82F6]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Person</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#8B5CF6]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Organization</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#10B981]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Topic</span>
                </div>
            </div>

            <p className="text-xs text-[#806B58] text-center mt-6 font-mono">
                * Drag nodes to rearrange. Scroll to zoom. This graph is built from 100% real company data.
            </p>
        </section>
    )
}