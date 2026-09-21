"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { Send, Ghost, User, Loader2, Sparkles } from "lucide-react"

// ✅ CHANGE 1: Added agentType to track exactly which agent suggested the action
interface Action {
    label: string
    type: string // Broadened to support all dynamic action types from the orchestrator
    agentType?: string
}

interface Message {
    role: 'user' | 'ghost'
    text: string
    agentName?: string
    actions?: Action[]
}

interface Employee {
    name: string
}

export default function GhostChatPage() {
    const { user } = useUser()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [selectedEmployee, setSelectedEmployee] = useState("")
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Fetch the list of departed colleagues from our own backend
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch('/api/handover-colleagues')
                const data = await res.json()
                if (res.ok) setEmployees(data.employees || [])
            } catch (err) {
                console.error('Failed to fetch colleagues:', err)
            } finally {
                setIsLoadingEmployees(false)
            }
        }
        fetchEmployees()
    }, [])

    // Auto-scroll to the latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Execute a suggested agent action through the real backend API
    const handleAction = async (action: Action) => {
        setIsLoading(true)

        // Show the user triggering the action in the chat
        setMessages(prev => [...prev, { role: 'user', text: `Please proceed with: ${action.label}` }])

        try {
            // ✅ CHANGE 3: Send agentType and a dynamic auditReason to the backend for the Full Audit Trail
            const res = await fetch('/api/agent-actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    actionType: action.type,
                    requestedBy: user?.id || user?.fullName || "unknown",
                    ghostName: selectedEmployee,
                    agentType: action.agentType || 'exit_agent', // Tells backend exactly which agent is acting
                    // Dynamic "WHY": No fake data, just a factual log of what the user clicked
                    auditReason: `User initiated '${action.label}' suggested by ${action.agentType?.replace('_agent', ' Agent') || 'Agent'}`
                })
            })

            const data = await res.json()

            if (data.success) {
                // ✅ UPDATED: Dynamically show the message returned by the risk-based backend
                const displayMessage = data.message || 'Action processed successfully.';

                setMessages(prev => [...prev, {
                    role: 'ghost',
                    text: `✅ ${displayMessage}`,
                    actions: [] // Clear the action buttons once the action completes
                }])
            } else {
                throw new Error(data.error || 'Action failed')
            }
        } catch (error) {
            console.error('Action error:', error)
            setMessages(prev => [...prev, {
                role: 'ghost',
                text: "⚠️ I encountered an error while trying to execute this action. Please try again or contact support."
            }])
        } finally {
            setIsLoading(false)
        }
    }

    // Send a chat message to the Orchestrator (Multi-Agent Router)
    const handleSend = async () => {
        if (!input.trim() || !selectedEmployee || isLoading) return

        const userMessage: Message = { role: 'user', text: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const res = await fetch('/api/veq-orchestrator', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: input,
                    employeeName: selectedEmployee,
                    userId: user?.id || "unknown"
                }),
            })
            const data = await res.json()

            if (res.ok && data.success) {
                // ✅ CHANGE 2: Map suggested actions to include the agentType dynamically
                const actionsWithAgentType = (data.suggestedActions || []).map((action: any) => ({
                    ...action,
                    // Converts "Exit Agent" to "exit_agent" for the backend permission matrix
                    agentType: data.agentName ? data.agentName.toLowerCase().replace(' agent', '') + '_agent' : 'unknown_agent'
                }))

                setMessages(prev => [...prev, {
                    role: 'ghost',
                    text: data.reply || "I have processed your request.",
                    agentName: data.agentName,
                    actions: actionsWithAgentType, // Pass the enriched actions to the UI
                }])
            } else {
                setMessages(prev => [...prev, { role: 'ghost', text: "Connection lost. Please try again." }])
            }
        } catch (error) {
            console.error('Send error:', error)
            setMessages(prev => [...prev, { role: 'ghost', text: "Network error. Please try again." }])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Digital Twin
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Ask a Colleague's Knowledge
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Ask questions grounded in a departing colleague's own documented work, decisions, and notes — with their consent, captured through their Exit Brain Dump.
            </p>

            <div className="mb-8">
                <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Select a colleague</label>
                <select
                    value={selectedEmployee}
                    onChange={(e) => { setSelectedEmployee(e.target.value); setMessages([]); }}
                    disabled={isLoadingEmployees}
                    className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown font-display text-lg disabled:opacity-50"
                >
                    <option value="">{isLoadingEmployees ? "Loading..." : "-- Choose a colleague --"}</option>
                    {employees.map((emp) => (
                        <option key={emp.name} value={emp.name}>{emp.name}</option>
                    ))}
                </select>
            </div>

            {selectedEmployee ? (
                <div className="rounded-2xl border hairline bg-cream-deep/40 flex flex-col h-[600px]">
                    {/* Chat header */}
                    <div className="p-4 border-b hairline flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brown/10 flex items-center justify-center text-brown">
                            <Ghost className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-display text-xl text-brown italic">{selectedEmployee}'s Knowledge</h3>
                            <p className="text-[10px] font-mono text-muted flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Powered by VEQ Continuity Engine
                            </p>
                        </div>
                    </div>

                    {/* Message list */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {messages.length === 0 && (
                            <div className="text-center py-20">
                                <Ghost className="w-12 h-12 text-muted mx-auto mb-4 opacity-50" />
                                <p className="text-brown font-display text-xl italic mb-2">Ready when you are.</p>
                                <p className="text-sm text-muted">Ask about {selectedEmployee}'s projects, decisions, or daily workflow.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brown text-cream-deep' : 'bg-gold/20 text-brown'}`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Ghost className="w-4 h-4" />}
                                </div>
                                <div className={`max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>

                                    {/* AGENT BADGE: Displays which specialized agent is responding */}
                                    {msg.role === 'ghost' && msg.agentName && (
                                        <span className="text-[10px] font-mono text-muted mb-1 ml-1 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3 text-gold" /> {msg.agentName}
                                        </span>
                                    )}

                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${msg.role === 'user' ? 'bg-brown text-cream-deep rounded-tr-none' : 'bg-white/60 text-brown rounded-tl-none border hairline'}`}>
                                        {msg.text}
                                    </div>

                                    {/* Render suggested agent actions */}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {msg.actions.map((action, actionIdx) => (
                                                <button
                                                    key={actionIdx}
                                                    onClick={() => handleAction(action)}
                                                    disabled={isLoading}
                                                    className="text-xs px-3 py-2 bg-gold/20 text-brown rounded-lg border border-gold/30 hover:bg-gold/30 transition-all flex items-center gap-1.5 font-mono font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Sparkles className="w-3 h-3" /> {action.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator while the system processes the request */}
                        {isLoading && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-brown shrink-0">
                                    <Ghost className="w-4 h-4" />
                                </div>
                                <div className="bg-white/60 p-4 rounded-2xl rounded-tl-none border hairline flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-brown" />
                                    <span className="text-xs font-mono text-muted">Orchestrating specialized agents...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message input */}
                    <div className="p-4 border-t hairline flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Ask about ${selectedEmployee}'s work...`}
                            className="flex-1 px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" /> Send
                        </button>
                    </div>
                </div>
            ) : (
                <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
                    <Ghost className="w-12 h-12 text-muted mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic mb-2">Select a colleague to begin.</p>
                    <p className="text-sm text-muted">Only colleagues with a completed, consented handover appear here.</p>
                </div>
            )}
        </section>
    )
}