"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Send, Lock, Brain, User, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"

interface QAThread {
    id: string
    employee_name: string
    question: string
    answer: string | null
    asked_by: string
    answered_by: string | null
    status: string
    is_locked: boolean
    created_at: string
}

export default function ReverseHandoverPage() {
    const { user } = useUser()
    const [qaThreads, setQaThreads] = useState<QAThread[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedEmployee, setSelectedEmployee] = useState("Rohan") // For demo/testing
    const [newQuestion, setNewQuestion] = useState("")
    const [answeringId, setAnsweringId] = useState<string | null>(null)
    const [answerText, setAnswerText] = useState("")

    // Fetch Q&A threads
    useEffect(() => {
        const fetchQA = async () => {
            const { data, error } = await supabase
                .from('qa_threads')
                .select('*')
                .eq('employee_name', selectedEmployee)
                .order('created_at', { ascending: false })

            if (error) console.error("Error fetching QA:", error)
            else if (data) setQaThreads(data)
            setIsLoading(false)
        }
        fetchQA()
    }, [selectedEmployee])

    const handleAskQuestion = async () => {
        if (!newQuestion.trim() || !user?.fullName) return;

        const { data, error } = await supabase
            .from('qa_threads')
            .insert([{
                employee_name: selectedEmployee,
                question: newQuestion,
                asked_by: user.fullName,
                status: 'open'
            }])
            .select()
            .single()

        if (!error && data) {
            setQaThreads([data, ...qaThreads])
            setNewQuestion("")
        }
    }

    const handleAnswerQuestion = async (threadId: string) => {
        if (!answerText.trim() || !user?.fullName) return;

        const { error } = await supabase
            .from('qa_threads')
            .update({ answer: answerText, answered_by: user.fullName, status: 'answered' })
            .eq('id', threadId)

        if (!error) {
            setQaThreads(qaThreads.map(t => t.id === threadId ? { ...t, answer: answerText, answered_by: user.fullName, status: 'answered' } : t))
            setAnsweringId(null)
            setAnswerText("")
        }
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            {/* 🏆 HEADER */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Knowledge Transfer · Reverse Handover
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                The Continuity Bridge
            </h1>
            <p className="text-muted max-w-xl mb-12">
                The new team member asks questions. The departing expert answers them.
                Every conversation is permanently saved in the Continuity Vault.
            </p>

            {/* Ask Question Box */}
            <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-10">
                <h3 className="font-display text-xl text-brown italic mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" /> Ask a Question to the Vault
                </h3>
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder={`Ask about ${selectedEmployee}'s workflow, decisions, or context...`}
                        className="flex-1 px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                    />
                    <button
                        onClick={handleAskQuestion}
                        className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        <Send className="w-4 h-4" /> Ask
                    </button>
                </div>
            </div>

            {/* Q&A Threads */}
            {isLoading ? (
                <p className="text-center text-muted font-mono py-10">Loading continuity bridge...</p>
            ) : qaThreads.length === 0 ? (
                <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
                    <Brain className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic mb-2">No questions asked yet.</p>
                    <p className="text-sm text-muted">Be the first to bridge the knowledge gap!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {qaThreads.map((thread) => (
                        <div key={thread.id} className={`rounded-2xl border hairline p-6 ${thread.is_locked ? 'bg-gray-50 opacity-75' : 'bg-cream-deep/40'}`}>

                            {/* Question */}
                            <div className="flex gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center text-brown shrink-0">
                                    <User className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-muted">{thread.asked_by}</span>
                                        <span className="font-mono text-[10px] text-muted">asked:</span>
                                    </div>
                                    <p className="text-brown text-lg font-display italic">{thread.question}</p>
                                </div>
                                {thread.is_locked && <Lock className="w-5 h-5 text-muted shrink-0" />}
                            </div>

                            {/* Answer */}
                            {thread.answer ? (
                                <div className="ml-14 pl-4 border-l-2 border-gold/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono text-xs text-muted">{thread.answered_by}</span>
                                        <span className="font-mono text-[10px] text-muted">answered:</span>
                                        <CheckCircle className="w-3 h-3 text-green-600" />
                                    </div>
                                    <p className="text-brown/90 leading-relaxed">{thread.answer}</p>
                                </div>
                            ) : answeringId === thread.id ? (
                                <div className="ml-14 pl-4 border-l-2 border-gold/50 space-y-3 animate-in fade-in">
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        placeholder="Share your context, the 'why', or the unspoken rule..."
                                        className="w-full p-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm min-h-[80px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setAnsweringId(null)} className="px-3 py-1 text-sm text-muted hover:text-brown">Cancel</button>
                                        <button onClick={() => handleAnswerQuestion(thread.id)} className="px-4 py-1 bg-brown text-cream-deep rounded-lg text-sm font-mono">Save to Vault</button>
                                    </div>
                                </div>
                            ) : !thread.is_locked ? (
                                <div className="ml-14">
                                    <button
                                        onClick={() => setAnsweringId(thread.id)}
                                        className="text-sm font-mono text-gold-deep hover:text-brown transition-colors flex items-center gap-1"
                                    >
                                        <MessageCircle className="w-3 h-3" /> Provide Answer / Context
                                    </button>
                                </div>
                            ) : (
                                <div className="ml-14 pl-4 border-l-2 border-gray-300">
                                    <p className="text-xs font-mono text-muted italic">Vault is locked. This thread is archived.</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}