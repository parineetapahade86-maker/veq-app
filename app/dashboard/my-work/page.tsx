// app/dashboard/my-work/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Briefcase, Plus, CheckCircle2, Circle, Clock, Trash2, Target, Loader2 } from "lucide-react"

// ✅ 1. Setup Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface WorkItem {
  id: string
  title: string
  category: "Task" | "Meeting" | "Focus"
  status: "In Progress" | "Completed"
  addedAt: string
}

export default function MyWorkPage() {
  const { user } = useUser()

  // Start empty, but we will fetch from DB immediately
  const [items, setItems] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)

  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<"Task" | "Meeting" | "Focus">("Focus")
  const [isAdding, setIsAdding] = useState(false)

  // ✅ 2. Fetch Data from Database on Mount
  useEffect(() => {
    if (user) {
      fetchWorkData()
    }
  }, [user])

  const fetchWorkData = async () => {
    setLoading(true)
    try {
      // Get company_id first
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single()

      if (profile?.company_id) {
        setCompanyId(profile.company_id)

        // ✅ Fetch ONLY from 'tasks' table (Knowledge is 100% safe!)
        const { data: tasks, error } = await supabase
          .from("tasks")
          .select("id, title, category, status, created_at")
          .eq("employee_id", user?.id) // Matches the user who created it
          .order("created_at", { ascending: false })

        if (!error && tasks) {
          const formattedItems: WorkItem[] = tasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category || "Focus",
            status: t.status === "Completed" ? "Completed" : "In Progress",
            addedAt: new Date(t.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setItems(formattedItems)
        }
      }
    } catch (err) {
      console.error("Error fetching work data:", err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ 3. Add Item to Database (Persists forever!)
  const handleAddItem = async () => {
    if (!newItemTitle.trim() || !companyId || !user) return

    setIsAdding(true)
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: newItemTitle,
          category: newItemCategory,
          status: "In Progress",
          employee_id: user.id,
          company_id: companyId
        })
        .select()
        .single()

      if (!error && data) {
        const newItem: WorkItem = {
          id: data.id,
          title: data.title,
          category: data.category,
          status: "In Progress",
          addedAt: new Date(data.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setItems([newItem, ...items]) // Add to top of list
        setNewItemTitle("")
      } else {
        console.error("Error adding task:", error)
        alert("Failed to save work item. Please try again.")
      }
    } catch (err) {
      console.error("Error adding task:", err)
    } finally {
      setIsAdding(false)
    }
  }

  // ✅ 4. Toggle Status in Database
  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "In Progress" ? "Completed" : "In Progress"

    // Optimistic UI update (feels instant!)
    setItems(items.map(item =>
      item.id === id ? { ...item, status: newStatus as "In Progress" | "Completed" } : item
    ))

    // Database update
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", id)

    if (error) {
      console.error("Error updating task:", error)
      // Revert on error
      setItems(items.map(item =>
        item.id === id ? { ...item, status: currentStatus as "In Progress" | "Completed" } : item
      ))
      alert("Failed to update status.")
    }
  }

  // ✅ 5. Delete Item from Database (ONLY 'tasks' table, Knowledge is SAFE!)
  const deleteItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this work item?")) return

    // Optimistic UI update
    const originalItems = [...items]
    setItems(items.filter(item => item.id !== id))

    // Database delete
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting task:", error)
      // Revert on error
      setItems(originalItems)
      alert("Failed to delete item.")
    }
  }

  const activeItems = items.filter(item => item.status === "In Progress")
  const completedItems = items.filter(item => item.status === "Completed")

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · My Work
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        My Work
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Everything currently assigned to you — tasks, open threads, and work in progress — in one place.
      </p>

      {/* Add Item Bar */}
      <div className="flex gap-3 mb-10 p-2 rounded-2xl border hairline bg-cream-deep/40">
        <Target className="w-5 h-5 text-brown mt-3 ml-2" />
        <input
          type="text"
          value={newItemTitle}
          onChange={(e) => setNewItemTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
          placeholder="Add a priority or task to your focus board..."
          className="flex-1 bg-transparent border-none focus:outline-none text-brown placeholder:text-muted py-3"
          disabled={isAdding || loading}
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as any)}
          className="bg-white/50 border hairline rounded-xl px-3 py-2 text-sm text-brown focus:outline-none focus:border-brown disabled:opacity-50"
          disabled={isAdding || loading}
        >
          <option value="Focus">Focus</option>
          <option value="Task">Task</option>
          <option value="Meeting">Meeting</option>
        </select>
        <button
          onClick={handleAddItem}
          disabled={isAdding || loading || !newItemTitle.trim()}
          className="px-5 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {isAdding ? "Saving..." : "Add"}
        </button>
      </div>

      {/* Active Items */}
      <div className="mb-10">
        <h2 className="font-display text-xl text-brown italic mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> In Progress ({activeItems.length})
        </h2>

        {loading ? (
          <div className="text-center py-8 text-muted font-mono">Loading your work...</div>
        ) : activeItems.length > 0 ? (
          <div className="space-y-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border hairline bg-cream-deep/40 p-5 flex items-center justify-between group hover:border-brown/50 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => toggleStatus(item.id, item.status)} className="text-muted hover:text-brown transition-colors">
                    <Circle className="w-6 h-6" />
                  </button>
                  <div>
                    <h3 className="font-display text-lg text-brown italic">{item.title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="px-2 py-0.5 bg-brown/10 text-brown rounded-md text-[10px] font-mono uppercase tracking-wider">
                        {item.category}
                      </span>
                      <span className="text-xs text-muted font-mono">Added at {item.addedAt}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border hairline border-dashed rounded-2xl bg-white/20">
            <Briefcase className="w-8 h-8 text-muted mx-auto mb-2" />
            <p className="text-sm text-muted">No active work items. Add one above to get started.</p>
          </div>
        )}
      </div>

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div>
          <h2 className="font-display text-xl text-muted italic mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Completed ({completedItems.length})
          </h2>
          <div className="space-y-3 opacity-60">
            {completedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border hairline bg-gray-100 p-5 flex items-center justify-between group"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => toggleStatus(item.id, item.status)} className="text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </button>
                  <h3 className="font-display text-lg text-muted italic line-through">{item.title}</h3>
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}