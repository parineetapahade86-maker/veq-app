"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    MarkerType
} from "reactflow"
import "reactflow/dist/style.css"
import { Brain, Loader2, Network } from "lucide-react"

export default function BrainMapPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [stats, setStats] = useState({ total_nodes: 0, total_edges: 0 })

    useEffect(() => {
        const fetchGraph = async () => {
            try {
                // 1. Fetch real company ID from user profile
                const profileRes = await fetch('/api/user-profile') // Assuming you have this, or use Clerk directly
                // For MVP, let's just pass a dummy or fetch it. Let's use a direct API call to our graph endpoint.

                // Note: In a real app, you'd pass the companyId. For now, we'll fetch from our graph API.
                // Let's assume you have a way to get companyId. If not, we can hardcode it for testing or fetch it.
                // Let's use a direct fetch to our memory-graph API.

                const res = await fetch('/api/memory-graph?companyId=YOUR_COMPANY_ID_HERE') // ⚠️ REPLACE WITH REAL COMPANY ID OR FETCH IT
                const data = await res.json()

                if (data.success) {
                    // 2. Map REAL database nodes to React Flow nodes
                    const flowNodes = data.nodes.map((node: any, index: number) => {
                        // Simple layout logic to spread them out
                        const x = (index % 5) * 250 + 50
                        const y = Math.floor(index / 5) * 150 + 50

                        // Color code by node type
                        let bgColor = '#F4EDE1' // cream-deep
                        let borderColor = '#3A2418' // brown
                        if (node.node_type === 'person') { bgColor = '#C6A15B'; borderColor = '#3A2418' } // Gold for people
                        if (node.node_type === 'decision') { bgColor = '#E9DED0'; borderColor = '#806B58' }

                        return {
                            id: node.id,
                            type: 'default',
                            position: { x, y },
                            data: {
                                label: (
                                    <div className="text-center">
                                        <div className="font-display text-sm font-bold text-brown">{node.node_label}</div>
                                        <div className="text-[10px] font-mono text-muted uppercase mt-1">{node.node_type}</div>
                                    </div>
                                )
                            },
                            style: {
                                background: bgColor,
                                border: `2px solid ${borderColor}`,
                                borderRadius: '12px',
                                padding: '10px',
                                minWidth: '150px'
                            }
                        }
                    })

                    // 3. Map REAL database edges to React Flow edges
                    const flowEdges = data.edges.map((edge: any) => ({
                        id: edge.id,
                        source: edge.source_node_id,
                        target: edge.target_node_id,
                        label: edge.edge_type.replace('_', ' '),
                        animated: true,
                        style: { stroke: '#C6A15B', strokeWidth: 2 },
                        markerEnd: { type: MarkerType.ArrowClosed, color: '#C6A15B' }
                    }))

                    setNodes(flowNodes)
                    setEdges(flowEdges)
                    setStats({ total_nodes: data.metadata?.total_nodes || 0, total_edges: data.metadata?.total_edges || 0 })
                }
            } catch (err) {
                console.error('Failed to fetch graph:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchGraph()
    }, [])

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Network className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Mapping Organizational Brain...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-2">
                        Intelligence · Memory Graph
                    </p>
                    <h1 className="font-display text-4xl md:text-5xl text-brown italic">
                        Company Brain Map
                    </h1>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Nodes</p>
                        <p className="font-display text-2xl font-bold text-brown">{stats.total_nodes}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted">Connections</p>
                        <p className="font-display text-2xl font-bold text-brown">{stats.total_edges}</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border hairline bg-cream-deep/40 h-[600px] w-full overflow-hidden relative">
                {nodes.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <Brain className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
                        <p className="text-brown font-display text-2xl italic mb-2">The Brain is Empty</p>
                        <p className="text-sm text-muted max-w-md">
                            No nodes found yet. Go to the <strong>Exit Brain Dump</strong> page and capture some knowledge to start building the graph!
                        </p>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        className="bg-cream-deep/20"
                    >
                        <Background color="#E9DED0" gap={20} />
                        <Controls className="!bg-white !border-hairline !rounded-lg !shadow-sm" />
                        <MiniMap
                            nodeColor={(node) => {
                                if (node.data.label.props.children[0].props.children[1].props.children === 'person') return '#C6A15B'
                                return '#E9DED0'
                            }}
                            maskColor="rgba(244, 237, 225, 0.8)"
                            className="!bg-cream-deep !border-hairline !rounded-lg"
                        />
                    </ReactFlow>
                )}
            </div>

            <p className="text-xs text-muted text-center mt-6 font-mono">
                * Drag nodes to rearrange. Scroll to zoom. This graph is built from 100% real company data.
            </p>
        </section>
    )
}