"use client"

import { useState } from "react"
import { Briefcase, Plus, CheckCircle2, Circle, Clock, Trash2, Target } from "lucide-react"

// Define the structure of a Work Item
interface WorkItem {
  id: string
  title: string
  category: "Task" | "Meeting" | "Focus"
  status: "In Progress" | "Completed"
  addedAt: string
}

export default function MyWorkPage() {
  // Start completely empty. No fake data!
  const [items, setItems] = useState<WorkItem[]>([])
  const [newItemTitle, setNewItemTitle] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<"Task" | "Meeting" | "Focus">("Focus")

  // Add a new item to the focus board
  const handleAddItem = () => {
    if (!newItemTitle.trim()) return

    const item: WorkItem = {
      id: Date.now().toString(),
      title: newItemTitle,
      category: newItemCategory,
      status: "In Progress",
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setItems([...items, item])
    setNewItemTitle("")
  }

  // Mark an item as completed
  const toggleStatus = (id: string) => {
    setItems(items.map(item =>
      item.id === id
        ? { ...item, status: item.status === "In Progress" ? "Completed" : "In Progress" }
        : item
    ))
  }

  // Delete an item
  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Filter items
  const activeItems = items.filter(item => item.status === "In Progress")
  const completedItems = items.filter(item => item.status === "Completed")

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
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
        />
        <select
          value={newItemCategory}
          onChange={(e) => setNewItemCategory(e.target.value as any)}
          className="bg-white/50 border hairline rounded-xl px-3 py-2 text-sm text-brown focus:outline-none focus:border-brown"
        >
          <option value="Focus">Focus</option>
          <option value="Task">Task</option>
          <option value="Meeting">Meeting</option>
        </select>
        <button
          onClick={handleAddItem}
          className="px-5 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Active Items */}
      <div className="mb-10">
        <h2 className="font-display text-xl text-brown italic mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" /> In Progress ({activeItems.length})
        </h2>

        {activeItems.length > 0 ? (
          <div className="space-y-3">
            {activeItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border hairline bg-cream-deep/40 p-5 flex items-center justify-between group hover:border-brown/50 transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <button onClick={() => toggleStatus(item.id)} className="text-muted hover:text-brown transition-colors">
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
                  <button onClick={() => toggleStatus(item.id)} className="text-green-600">
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