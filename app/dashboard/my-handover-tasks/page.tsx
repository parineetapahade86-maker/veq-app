"use client"

import { useState, useEffect } from "react"
import { Brain, Clock, CheckCircle, Video, MessageSquare, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"

interface MicroTask {
    id: string
    employee_name: string
    day_number: number
    prompt: string
    response_type: string
    response_content: string
    status: string
}

export default function MyHandoverTasksPage() {
    const { user } = useUser()
    const [tasks, setTasks] = useState<MicroTask[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
    const [responseText, setResponseText] = useState("")

    // Fetch pending tasks for the logged-in user
    useEffect(() => {
        const fetchTasks = async () => {
            if (!user?.fullName) return;

            const { data, error } = await supabase
                .from('micro_tasks')
                .select('*')
                .eq('employee_name', user.fullName) // Match by name (can be upgraded to email/ID later)
                .order('day_number', { ascending: true })

            if (error) console.error("Error fetching tasks:", error)
            else if (data) setTasks(data)

            setIsLoading(false)
        }
        fetchTasks()
    }, [user])

    const handleSubmitTask = async (taskId: string) => {
        if (!responseText.trim()) return;

        const { error } = await supabase
            .from('micro_tasks')
            .update({ response_content: responseText, status: 'completed' })
            .eq('id', taskId)

        if (!error) {
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed', response_content: responseText } : t))
            setActiveTaskId(null)
            setResponseText("")
        }
    }

    return (
        <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
            {/* 🏆 HEADER */}
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                My Continuity · Micro-Interviews
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Secure Your Legacy
            </h1>
            <p className="text-muted max-w-xl mb-12">
                No massive documents. Just 5-minute micro-tasks to ensure your hard-earned knowledge stays with the team.
                You are building the future for the next person. 🚀
            </p>

            {/* 🧠 TASKS LIST */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-brown animate-spin mb-4" />
                    <p className="text-muted font-mono text-sm">Loading your micro-tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-brown font-display text-xl italic mb-2">All caught up!</p>
                    <p className="text-sm text-muted">You have no pending micro-tasks. Your legacy is secure.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {tasks.map((task) => (
                        <div key={task.id} className={`rounded-2xl border hairline p-6 transition-all ${task.status === 'completed' ? 'bg-green-50/50 border-green-200' : 'bg-cream-deep/40 hover:border-brown/50'}`}>

                            {/* Task Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gold/20 text-brown'}`}>
                                        {task.response_type === 'video' ? <Video className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <span className="font-mono text-[10px] tracking-widest uppercase text-muted">Day {task.day_number} Task</span>
                                        <h3 className="font-display text-xl text-brown italic mt-1">
                                            {task.status === 'completed' ? 'Legacy Secured!' : '5-Minute Micro-Task'}
                                        </h3>
                                    </div>
                                </div>
                                {task.status === 'completed' && <CheckCircle className="w-6 h-6 text-green-600" />}
                            </div>

                            {/* Task Prompt */}
                            <p className="text-brown/90 leading-relaxed mb-6 bg-white/40 p-4 rounded-xl border hairline">
                                {task.prompt}
                            </p>

                            {/* Response Area */}
                            {task.status === 'pending' ? (
                                activeTaskId === task.id ? (
                                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                        <textarea
                                            value={responseText}
                                            onChange={(e) => setResponseText(e.target.value)}
                                            placeholder="Type your quick knowledge drop here..."
                                            className="w-full p-4 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm min-h-[100px]"
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => { setActiveTaskId(null); setResponseText(""); }} className="px-4 py-2 text-sm font-mono text-muted hover:text-brown">Cancel</button>
                                            <button onClick={() => handleSubmitTask(task.id)} className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold">
                                                <Brain className="w-4 h-4" /> Save to Vault
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setActiveTaskId(task.id)}
                                        className="w-full py-3 border hairline border-dashed border-brown/40 rounded-xl text-brown font-mono text-sm hover:bg-brown/5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Clock className="w-4 h-4" /> Tap to complete this 5-min task
                                    </button>
                                )
                            ) : (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <p className="text-xs font-mono text-green-800 uppercase mb-1">Your Contribution:</p>
                                    <p className="text-brown/80 text-sm">{task.response_content}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}