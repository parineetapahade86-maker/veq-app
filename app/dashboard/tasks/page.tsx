"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import {
  CheckSquare,
  Plus,
  Search,
  Sparkles,
  Sun,
  Loader2,
  X,
  ListTodo,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react"

// ---------- Types ----------

interface TaskItem {
  title: string
  priority: "high" | "medium" | "low"
  notes?: string
  done?: boolean
}

interface DailyPlan {
  id?: string
  date?: string
  tasks: TaskItem[]
  ai_summary?: string
}

// ---------- Constants ----------

const MAX_BRIEFING_LENGTH = 5000

// ---------- Component ----------

export default function TasksPage() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")

  // Daily plan states
  const [dailyPlan, setDailyPlan] = useState<DailyPlan | null>(null)
  const [loadingPlan, setLoadingPlan] = useState(true)

  // AI briefing modal states
  const [isBriefingOpen, setIsBriefingOpen] = useState(false)
  const [briefingText, setBriefingText] = useState("")
  const [isSavingBriefing, setIsSavingBriefing] = useState(false)

  // Error feedback (replaces alert())
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // ---------- Data fetching ----------

  const fetchDailyPlan = useCallback(async () => {
    setLoadingPlan(true)
    try {
      const res = await fetch("/api/daily-plan")
      const data = await res.json()
      if (data.success && data.data) {
        setDailyPlan(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch daily plan:", err)
      setErrorMessage("Could not load your plan. Please refresh.")
    } finally {
      setLoadingPlan(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchDailyPlan()
    }
  }, [user, fetchDailyPlan])

  // ---------- Handlers ----------

  const handleSaveBriefing = async () => {
    const text = briefingText.trim()
    if (!text) return
    if (text.length > MAX_BRIEFING_LENGTH) {
      setErrorMessage(`Text too long (max ${MAX_BRIEFING_LENGTH} characters).`)
      return
    }

    setIsSavingBriefing(true)
    setErrorMessage(null)
    try {
      const res = await fetch("/api/daily-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: text }),
      })
      const data = await res.json()

      if (data.success) {
        setDailyPlan(data.data)
        setBriefingText("")
        setIsBriefingOpen(false)
      } else {
        setErrorMessage(data.error || "Failed to save your plan.")
      }
    } catch (err) {
      console.error("Failed to save briefing:", err)
      setErrorMessage("Network error. Please try again.")
    } finally {
      setIsSavingBriefing(false)
    }
  }

  // Toggle task completion (local state — persist later via API)
  const toggleTask = (index: number) => {
    setDailyPlan((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks.map((t, i) =>
        i === index ? { ...t, done: !t.done } : t
      )
      return { ...prev, tasks }
    })
  }

  // Delete a task (local state — persist later via API)
  const deleteTask = (index: number) => {
    setDailyPlan((prev) => {
      if (!prev) return prev
      const tasks = prev.tasks.filter((_, i) => i !== index)
      return { ...prev, tasks }
    })
  }

  const closeBriefingModal = () => {
    if (isSavingBriefing) return // don't close while saving
    setIsBriefingOpen(false)
    setErrorMessage(null)
  }

  // Close modal on Escape key
  useEffect(() => {
    if (!isBriefingOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeBriefingModal()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isBriefingOpen, isSavingBriefing])

  // ---------- Derived data ----------

  // ✅ Search actually filters tasks now!
  const filteredTasks = useMemo(() => {
    if (!dailyPlan?.tasks) return []
    const q = searchQuery.trim().toLowerCase()
    if (!q) return dailyPlan.tasks
    return dailyPlan.tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
    )
  }, [dailyPlan, searchQuery])

  const completedCount = dailyPlan?.tasks.filter((t) => t.done).length ?? 0

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  // ---------- Render ----------

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
        Workspace · Tasks
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
        Tasks
      </h1>
      <p className="text-[#806B58] max-w-xl mb-8">
        Write a task yourself, or describe it in plain words and let VEQ&apos;s
        AI turn it into one.
      </p>

      {/* Global error banner */}
      {errorMessage && !isBriefingOpen && (
        <div className="mb-6 flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
          <button
            onClick={() => setErrorMessage(null)}
            className="ml-auto hover:text-red-900"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- AI BRIEFING SECTION --- */}
      {loadingPlan ? (
        <div className="mb-8 flex items-center justify-center p-8 rounded-2xl border border-[#E9DED0]">
          <Loader2 className="w-6 h-6 animate-spin text-[#806B58] mr-2" />
          <span className="text-[#806B58]">Loading your daily plan...</span>
        </div>
      ) : dailyPlan && dailyPlan.tasks.length > 0 ? (
        // PLAN EXISTS
        <div className="mb-8 rounded-2xl border border-[#C6A15B]/30 bg-gradient-to-br from-[#C6A15B]/10 to-[#F4EDE1] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/20 flex items-center justify-center">
                <Sun className="w-6 h-6 text-[#3A2418]" />
              </div>
              <div>
                <h2 className="font-display text-2xl text-[#3A2418] italic">
                  {getGreeting()}, {user?.firstName || "Friend"}! 👋
                </h2>
                <p className="text-sm text-[#806B58]">
                  {dailyPlan.ai_summary ||
                    `Your ${dailyPlan.tasks.length} tasks are ready!`}
                  {" · "}
                  {completedCount}/{dailyPlan.tasks.length} completed
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="px-4 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors flex items-center gap-2 font-mono text-sm shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              Update Plan
            </button>
          </div>

          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-[#806B58] py-4 text-center">
                No tasks match your search.
              </p>
            ) : (
              filteredTasks.map((task) => {
                // Use the task's real index so toggle/delete work even while filtering
                const realIndex = dailyPlan.tasks.indexOf(task)
                return (
                  <div
                    key={`task.title−{task.title}-task.title−{realIndex}`}
                    className={`flex items-center gap-3 p-3 rounded-xl bg-white/60 border border-[#E9DED0] transition-opacity ${task.done ? "opacity-50" : ""
                      }`}
                  >
                    <button
                      onClick={() => toggleTask(realIndex)}
                      className="shrink-0 text-[#806B58] hover:text-[#3A2418] transition-colors"
                      aria-label={task.done ? "Mark as not done" : "Mark as done"}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-[#3A2418] font-medium ${task.done ? "line-through" : ""
                          }`}
                      >
                        {task.title}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-[#806B58] mt-1">{task.notes}</p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-mono px-2 py-1 rounded-lg shrink-0 ${task.priority === "high"
                          ? "bg-red-100 text-red-700"
                          : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {task.priority}
                    </span>
                    <button
                      onClick={() => deleteTask(realIndex)}
                      className="shrink-0 p-1 text-[#806B58] hover:text-red-600 transition-colors"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        // NO PLAN YET
        <div className="mb-8 rounded-2xl border-2 border-dashed border-[#C6A15B]/30 bg-[#C6A15B]/5 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#C6A15B]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-[#3A2418]" />
              </div>
              <div>
                <h2 className="font-display text-xl text-[#3A2418] italic mb-1">
                  Start Your Day with AI Planning
                </h2>
                <p className="text-sm text-[#806B58]">
                  Describe what you need to do today, and let AI organize it
                  for you.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsBriefingOpen(true)}
              className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors flex items-center gap-2 font-mono text-sm font-semibold shrink-0"
            >
              <Plus className="w-4 h-4" />
              Create Plan
            </button>
          </div>
        </div>
      )}

      {/* --- AI BRIEFING MODAL --- */}
      {isBriefingOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
          onClick={closeBriefingModal} // ✅ click outside to close
          role="dialog"
          aria-modal="true"
          aria-labelledby="briefing-title"
        >
          <div
            className="bg-[#F4EDE1] rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                id="briefing-title"
                className="font-display text-2xl text-[#3A2418] italic"
              >
                Today&apos;s AI Briefing
              </h3>
              <button
                onClick={closeBriefingModal}
                className="p-2 text-[#806B58] hover:text-[#3A2418]"
                aria-label="Close"
                disabled={isSavingBriefing}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#806B58] mb-4">
              Describe everything you need to do today in plain words. AI will
              extract tasks, set priorities, and organize them.
            </p>

            {/* Inline error inside modal too */}
            {errorMessage && (
              <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <textarea
              value={briefingText}
              onChange={(e) => setBriefingText(e.target.value)}
              placeholder="Example: I need to finish the Q3 report with sales data, call Client X about the proposal, and review the team meeting notes..."
              rows={8}
              maxLength={MAX_BRIEFING_LENGTH}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none mb-2"
            />
            <p className="text-xs text-[#806B58] mb-4 text-right">
              {briefingText.length}/{MAX_BRIEFING_LENGTH}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeBriefingModal}
                disabled={isSavingBriefing}
                className="px-6 py-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBriefing}
                disabled={isSavingBriefing || !briefingText.trim()}
                className="px-6 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] disabled:opacity-50 flex items-center gap-2 font-mono text-sm font-semibold"
              >
                {isSavingBriefing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Tasks
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SEARCH & ADD TASK BAR --- */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#806B58]" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9DED0] bg-white/50 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsBriefingOpen(true)} // ✅ now it does something!
          className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-2xl hover:bg-[#4A2F20] transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* --- EMPTY STATE (only if no plan exists) --- */}
      {!dailyPlan && !loadingPlan && (
        <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center">
          <ListTodo className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
          <p className="text-[#3A2418] font-display text-xl italic mb-2">
            Your task list is empty.
          </p>
          <p className="text-sm text-[#806B58]">
            Click &apos;Add Task&apos; or use AI Briefing to get started.
          </p>
        </div>
      )}
    </section>
  )
}
