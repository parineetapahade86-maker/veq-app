"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { RefreshCcw, ThumbsUp, ThumbsDown, Minus, CheckCircle2, Clock, Loader2, BookOpen } from "lucide-react"

export default function OutcomeLoopPage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(true)
    const [pendingOutcomes, setPendingOutcomes] = useState<any[]>([])
    const [completedOutcomes, setCompletedOutcomes] = useState<any[]>([])
    const [reviewingId, setReviewingId] = useState<string | null>(null)
    const [reviewNotes, setReviewNotes] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch both pending and completed outcomes
                const [pendingRes, completedRes] = await Promise.all([
                    fetch('/api/pending-outcomes'),
                    fetch('/api/completed-outcomes') // We will create this simple GET API below
                ])

                const pendingData = await pendingRes.json()
                const completedData = await completedRes.json()

                if (pendingData.success) setPendingOutcomes(pendingData.data)
                if (completedData.success) setCompletedOutcomes(completedData.data)
            } catch (err) {
                console.error('Failed to fetch outcomes:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const handleOutcomeSubmit = async (memoryId: string, status: 'positive' | 'neutral' | 'negative') => {
        setSubmitting(true)
        try {
            const res = await fetch('/api/outcome-review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ memoryId, outcomeStatus: status, outcomeNotes: reviewNotes })
            })
            const data = await res.json()
            if (data.success) {
                // Move from pending to completed locally for instant UI update
                const completedItem = pendingOutcomes.find(item => item.id === memoryId)
                if (completedItem) {
                    setCompletedOutcomes(prev => [{ ...completedItem, outcome_status: status, outcome_notes: reviewNotes, outcome_reviewed_at: new Date().toISOString() }, ...prev])
                    setPendingOutcomes(prev => prev.filter(item => item.id !== memoryId))
                }
                setReviewingId(null)
                setReviewNotes("")
                alert(`✅ Outcome logged as ${status.toUpperCase()}! VEQ has learned from this real-world result.`)
            }
        } catch (err) {
            console.error('Failed to submit outcome:', err)
            alert('Failed to log outcome.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <RefreshCcw className="w-12 h-12 text-brown animate-spin mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic">Loading Learning Loop...</p>
                </div>
            </section>
        )
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Continuous Learning
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Outcome & Learning Loop
            </h1>
            <p className="text-muted max-w-2xl mb-12">
                The core of VEQ's intelligence. Review past decisions, log their real-world results, and make the AI smarter for the future.
            </p>

            {/* 🔥 SECTION 1: PENDING OUTCOMES (The "Supplier B" Scenario) */}
            <div className="mb-16">
                <div className="flex items-center gap-3 mb-6">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <h2 className="font-display text-2xl text-brown italic">Awaiting Real-World Results ({pendingOutcomes.length})</h2>
                </div>

                {pendingOutcomes.length === 0 ? (
                    <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 text-center">
                        <p className="text-muted">No pending decisions. All caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {pendingOutcomes.map((item) => (
                            <div key={item.id} className="rounded-xl bg-white/80 border hairline p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="font-display text-lg text-brown italic">{item.topic}</h3>
                                        <p className="text-xs font-mono text-muted mt-1">Decision made on: {new Date(item.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-[10px] font-mono uppercase tracking-wider font-bold">
                                        Awaiting Outcome
                                    </span>
                                </div>

                                <p className="text-sm text-brown mb-6 bg-cream-deep/40 p-4 rounded-lg border hairline whitespace-pre-wrap">{item.content}</p>

                                {reviewingId === item.id ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <label className="block text-xs font-mono text-muted uppercase tracking-widest">Log the Real-World Result</label>
                                        <textarea
                                            className="w-full p-3 rounded-lg border hairline bg-white text-sm text-brown focus:outline-none focus:border-brown"
                                            rows={3}
                                            placeholder="e.g., 'Cost reduced by 15%, delivery was 2 days faster, no complaints so far.'"
                                            value={reviewNotes}
                                            onChange={(e) => setReviewNotes(e.target.value)}
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'positive')}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-semibold disabled:opacity-50"
                                            >
                                                <ThumbsUp className="w-4 h-4" /> Positive Outcome
                                            </button>
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'neutral')}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold disabled:opacity-50"
                                            >
                                                <Minus className="w-4 h-4" /> Neutral
                                            </button>
                                            <button
                                                onClick={() => handleOutcomeSubmit(item.id, 'negative')}
                                                disabled={submitting}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold disabled:opacity-50"
                                            >
                                                <ThumbsDown className="w-4 h-4" /> Negative Outcome
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => { setReviewingId(null); setReviewNotes(""); }}
                                            className="text-xs text-muted hover:text-brown underline w-full text-center"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setReviewingId(item.id)}
                                        className="w-full px-4 py-3 bg-brown text-cream-deep rounded-lg hover:bg-brown/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <RefreshCcw className="w-4 h-4" /> Log Real-World Outcome
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/*  SECTION 2: COMPLETED OUTCOMES (The "Learning History") */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <h2 className="font-display text-2xl text-brown italic">Verified Learning History ({completedOutcomes.length})</h2>
                </div>

                {completedOutcomes.length === 0 ? (
                    <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 text-center">
                        <p className="text-muted">No verified outcomes yet. Log your first result above!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {completedOutcomes.map((item) => {
                            const isPositive = item.outcome_status === 'positive';
                            const isNegative = item.outcome_status === 'negative';
                            const statusColor = isPositive ? 'text-green-700 bg-green-50 border-green-200' : isNegative ? 'text-red-700 bg-red-50 border-red-200' : 'text-gray-700 bg-gray-50 border-gray-200';
                            const StatusIcon = isPositive ? ThumbsUp : isNegative ? ThumbsDown : Minus;

                            return (
                                <div key={item.id} className="rounded-xl bg-white/80 border hairline p-5 shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-display text-base text-brown italic line-clamp-1">{item.topic}</h3>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold flex items-center gap-1 ${statusColor}`}>
                                            <StatusIcon className="w-3 h-3" /> {item.outcome_status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-muted mb-3">Verified on: {new Date(item.outcome_reviewed_at).toLocaleDateString()}</p>
                                    {item.outcome_notes && (
                                        <p className="text-sm text-brown bg-cream-deep/40 p-3 rounded-lg border hairline italic">
                                            "{item.outcome_notes}"
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}