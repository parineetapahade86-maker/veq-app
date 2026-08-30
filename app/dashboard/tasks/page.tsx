"use client"

import { useState } from "react"
import { CheckSquare, Plus, Search, Trash2, Clock, AlertCircle, CheckCircle2, Circle, Tag, Save, X } from "lucide-react"

// Define the structure of a Task
interface Task {
  id: string
  title: string
  description: string
  priority: "Low" | "Medium" | "High" | "Urgent"
  status: "Todo" | "In Progress" | "Completed"
  createdAt: string
}

export default function TasksPage() {
  // Start completely empty. No fake data!
  const [tasks, setTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"All" | "Todo" | "In Progress" | "Completed">("All")

  // State to control the "Add Task" form
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State to hold the new task's details
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "Medium" as "Low" | "Medium" | "High" | "Urgent",
    status: "Todo" as "Todo" | "In Progress" | "Completed"
  })

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewTask(prev => ({ ...prev, [name]: value }))
  }

  // Save the new task to the list
  const handleSaveTask = () => {
    if (!newTask.title) {
      alert("Title is required!")
      return
    }

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    setTasks([...tasks, task])

    // Reset form and close it
    setNewTask({ title: "", description: "", priority: "Medium", status: "Todo" })
    setIsFormOpen(false)
  }

  // Update task status
  const handleStatusChange = (id: string, newStatus: "Todo" | "In Progress" | "Completed") => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, status: newStatus } : task
    ))
  }

  // Delete a task from the list
  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  // Filter tasks based on search query and status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === "All" || task.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Sort tasks: Urgent first, then High, Medium, Low
  const priorityOrder = { "Urgent": 0, "High": 1, "Medium": 2, "Low": 3 }
  const sortedTasks = [...filteredTasks].sort((a, b) =>
    priorityOrder[a.priority] - priorityOrder[b.priority]
  )

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Urgent": return "bg-red-100 text-red-800 border-red-200"
      case "High": return "bg-orange-100 text-orange-800 border-orange-200"
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "Low": return "bg-green-100 text-green-800 border-green-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case "In Progress": return <Clock className="w-5 h-5 text-blue-600" />
      default: return <Circle className="w-5 h-5 text-muted" />
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Tasks
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Tasks
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Write a task yourself, or describe it in plain words and let VEQ's AI turn it into one.
      </p>

      {/* Action Bar: Search + Filter + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown placeholder:text-muted transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="px-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown"
        >
          <option value="All">All Status</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Add Task Form (Shows only when isFormOpen is true) */}
      {isFormOpen && (
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-brown italic">New Task</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-brown">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">TASK TITLE *</label>
              <input
                type="text"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="e.g. Review Q3 financial report"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">DESCRIPTION</label>
              <textarea
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Add more details about this task..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-2">PRIORITY</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-2">STATUS</label>
                <select
                  name="status"
                  value={newTask.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-2 text-sm font-mono text-muted hover:text-brown transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTask}
              className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Task
            </button>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task) => (
            <div
              key={task.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-brown/50 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Status Icon */}
                <button
                  onClick={() => {
                    const nextStatus = task.status === "Todo" ? "In Progress" : task.status === "In Progress" ? "Completed" : "Todo"
                    handleStatusChange(task.id, nextStatus)
                  }}
                  className="mt-1 hover:scale-110 transition-transform"
                >
                  {getStatusIcon(task.status)}
                </button>

                {/* Task Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className={`font-display text-xl italic ${task.status === "Completed" ? "text-muted line-through" : "text-brown"
                      }`}>
                      {task.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {task.description && (
                    <p className="text-sm text-brown/80 mb-3 whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-muted font-mono">
                      Created {task.createdAt}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            <CheckSquare className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-brown font-display text-xl italic mb-2">
              {searchQuery || filterStatus !== "All" ? "No tasks match your filters." : "Your task list is empty."}
            </p>
            <p className="text-sm text-muted">
              {searchQuery || filterStatus !== "All" ? "Try adjusting your search or filters." : "Click 'Add Task' to get started."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}