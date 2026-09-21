"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Handshake, CheckCircle2, Loader2, AlertTriangle, FileText, GitBranch, ArrowRight } from "lucide-react"

interface HandoverTask {
    id: string
    task_type?: string
    payload?: {
        title?: string
        description?: string
        urgency?: string
    }
    ghost_name?: string
}

interface HandoverMemory {
    id: string
    topic?: string
    content?: string
}

interface HandoverData {
    tasks: HandoverTask[]
    memories: HandoverMemory[]
    predecessor: string | null
}

export default function SuccessorHandoverPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [handoverData, setHandoverData] = useState<HandoverData>({ tasks: [], memories: [], predecessor: null })
    const [acceptingId, setAcceptingId] = useState<string | null>(null)

    useEffect(() => {
        const fetchHandover = async () => {
            try {
                // Fetch pending handover items assigned to this user
                // For MVP: We fetch tasks where handover_status is 'pending' and ghost_name matches a departed employee
                // In a real app, HR explicitly assigns the successor, linking their user ID.
                const res = await fetch('/api/handover/pending')
                const data = await res.json()
                if (data.success) setHandoverData(data.data)
            } catch (err) {
                console.error('Failed to fetch handover:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHandover()
    }, [])

    const handleAccept = async (id: string, type: 'task' | 'memory') => {
        setAcceptingId(id)
        try {
            const res = await fetch('/api/handover/accept', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: type === 'task' ? id : null, memoryId: type === 'memory' ? id : null, itemType: type })
            })
            const result = await res.json()
            if (result.success) {
                // Remove from local state to show instant UI update
                if (type === 'task') {
                    setHandoverData(prev => ({ ...prev, tasks: prev.tasks.filter((t) => t.id !== id) }))
                } else {
                    setHandoverData(prev => ({ ...prev, memories: prev.memories.filter((m) => m.id !== id) }))
                }
                alert("✅ Handover Accepted! You are now the official owner of this responsibility.")
            }
        } catch (err) {
            console.error(err)
            alert("Failed to accept. Please try again.")
        } finally {
            setAcceptingId(null)
        }
    }

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <Handshake className="w-12 h-12 text-brown animate-pulse mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Loading Your Handover Package...</p>
                </div>
            </section>
        )
    }

    if (handoverData.tasks.length === 0 && handoverData.memories.length === 0) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-6" />
                <h1 className="font-display text-4xl text-brown italic mb-4">All Caught Up!</h1>
                <p className="text-muted max-w-md mx-auto">You have no pending handover items. Your knowledge transfer is complete.</p>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Continuity · Successor Handover
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Your Handover Package
            </h1>
            <p className="text-muted max-w-2xl mb-12">
                Welcome to the team! Below are the critical tasks, processes, and dependencies left by <strong>{handoverData.predecessor || 'your predecessor'}</strong>.
                Review them and click "Accept Ownership" to officially add them to your responsibilities.
            </p>

            {/* 🔥 SECTION 1: PENDING TASKS */}
            <div className="mb-12">
                <h2 className="font-display text-2xl text-brown italic mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Pending Tasks & Responsibilities
                </h2>
                <div className="space-y-4">
                    {handoverData.tasks.map((task) => (
                        <div key={task.id} className="rounded-xl bg-white/80 border hairline p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-display text-lg text-brown italic mb-1">{task.payload?.title || task.task_type}</h3>
                                <p className="text-sm text-muted mb-2">{task.payload?.description || 'No description provided.'}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${task.payload?.urgency === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {task.payload?.urgency || 'medium'} Priority
                                    </span>
                                    <span className="text-xs text-muted font-mono">From: {task.ghost_name}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleAccept(task.id, 'task')}
                                disabled={acceptingId === task.id}
                                className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
                            >
                                {acceptingId === task.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Accepting...</>
                                ) : (
                                    <><Handshake className="w-4 h-4" /> Accept Ownership</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🔥 SECTION 2: CRITICAL DEPENDENCIES */}
            <div>
                <h2 className="font-display text-2xl text-brown italic mb-6 flex items-center gap-2">
                    <GitBranch className="w-5 h-5" /> Hidden Dependencies & Context
                </h2>
                <div className="space-y-4">
                    {handoverData.memories.map((memory) => (
                        <div key={memory.id} className="rounded-xl bg-cream-deep/40 border hairline p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div>
                                <h3 className="font-display text-lg text-brown italic mb-1">{memory.topic}</h3>
                                <p className="text-sm text-muted leading-relaxed">{memory.content}</p>
                            </div>
                            <button
                                onClick={() => handleAccept(memory.id, 'memory')}
                                disabled={acceptingId === memory.id}
                                className="px-6 py-3 border border-brown text-brown rounded-xl hover:bg-brown hover:text-cream-deep transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 whitespace-nowrap"
                            >
                                {acceptingId === memory.id ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Acknowledging...</>
                                ) : (
                                    <><CheckCircle2 className="w-4 h-4" /> Acknowledge</>
                                )}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}