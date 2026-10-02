// app/dashboard/brain-map/page.tsx
"use client"

import { useEffect, useState } from "react"
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState
} from "reactflow"
import "reactflow/dist/style.css"
import { Brain, Network } from "lucide-react"

export default function KnowledgeGraphPage() {
    const [nodes, setNodes] = useNodesState([])
    const [edges, setEdges] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ totalNodes: 0, totalEdges: 0, totalDocuments: 0 })

    useEffect(() => {
        fetchGraphData()
    }, [])

    const fetchGraphData = async () => {
        try {
            // ✅ YE HAMAARA NAYA, POWERFUL API ENDPOINT HAI!
            const res = await fetch("/api/knowledge-graph")
            const data = await res.json()

            if (data.nodes && data.edges) {
                setNodes(data.nodes)
                setEdges(data.edges)
                setStats(data.stats || { totalNodes: 0, totalEdges: 0, totalDocuments: 0 })
            }
        } catch (error) {
            console.error("Error fetching graph:", error)
        } finally {
            setLoading(false)
        }
    }

    // 1. Loading State
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

    // 2. Empty State (Agar abhi tak koi data nahi hai)
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

    // 3. SUCCESS STATE: The Live Graph!
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

            {/* Graph Container */}
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
                            if (node.type === 'document') return '#C6A15B'
                            if (node.data?.type === 'person') return '#3B82F6'
                            if (node.data?.type === 'organization') return '#8B5CF6'
                            if (node.data?.type === 'topic') return '#10B981'
                            return '#806B58'
                        }}
                        maskColor="rgba(58, 36, 24, 0.1)"
                        className="!bg-[#F4EDE1] !border-[#E9DED0] !rounded-lg"
                    />
                </ReactFlow>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#C6A15B] border-2 border-[#3A2418]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Document / Source</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#3B82F6] border-2 border-[#1E40AF]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Person</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#8B5CF6] border-2 border-[#5B21B6]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Organization</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#10B981] border-2 border-[#047857]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Topic</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-[#F59E0B] border-2 border-[#B45309]"></div>
                    <span className="text-[#806B58] font-mono text-xs font-semibold">Date / Action</span>
                </div>
            </div>

            <p className="text-xs text-[#806B58] text-center mt-6 font-mono">
                * Drag nodes to rearrange. Scroll to zoom. This graph is built from 100% real company data.
            </p>
        </section>
    )
}