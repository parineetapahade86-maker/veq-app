"use client"

import { useState, useRef, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sparkles, Send, Bot, User } from "lucide-react"

interface Message {
  id: string
  role: "user" | "ai"
  content: string
  timestamp: Date
}

// Map paths to human-readable page names
const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard Overview",
  "/dashboard/overview": "Overview",
  "/dashboard/my-work": "My Work",
  "/dashboard/meetings": "Meetings",
  "/dashboard/documents": "Documents",
  "/dashboard/videos": "Videos",
  "/dashboard/calendar": "Calendar",
  "/dashboard/tasks": "Tasks",
  "/dashboard/knowledge": "Knowledge Base",
  "/dashboard/ai-guide": "AI Guide",
  "/dashboard/plugins": "Plugins & Integrations",
  "/dashboard/employees": "Employees",
  "/dashboard/settings": "Settings"
}

export default function AiGuidePage() {
  const pathname = usePathname()

  // Get the current page name or default to AI Guide
  const currentPage = pageNames[pathname] || "AI Guide"

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: `Hello! I am VEQ AI. I can see you're currently viewing the **${currentPage}** page. I'm connected to all your data - GitHub, Slack, Google Calendar, Drive, Tasks, Meetings, Documents, and more. How can I help you today?`,
      timestamp: new Date(),
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-guide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: userMessage.content,
          currentContext: currentPage, // 👈 SABHI PAGES KA NAAM JAYEGA
          currentPath: pathname
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: data.response,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])

    } catch (error) {
      console.error("AI Guide error:", error)
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: "Sorry, I encountered an error while processing your request. Please check your connections and try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-8 shrink-0">
        <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
          Workspace · AI Guide
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
          AI Guide
        </h1>
        <p className="text-muted max-w-xl">
          Ask me anything about your work across all pages - Tasks, Meetings, Documents, Calendar, and more.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border hairline bg-cream-deep/20 p-6 mb-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-brown flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-cream-deep" />
              </div>
            )}

            <div
              className={`max-w-[80%] rounded-2xl p-4 ${msg.role === "user"
                  ? "bg-brown text-cream-deep rounded-br-none"
                  : "bg-white border hairline text-brown rounded-bl-none"
                }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              <p
                className={`text-[10px] mt-2 font-mono ${msg.role === "user" ? "text-cream-deep/60" : "text-muted"
                  }`}
              >
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-cream-deep border hairline flex items-center justify-center shrink-0">
                <User className="w-5 h-5 text-brown" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-brown flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-cream-deep" />
            </div>
            <div className="bg-white border hairline rounded-2xl rounded-bl-none p-4 flex gap-1 items-center">
              <div className="w-2 h-2 bg-brown rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-brown rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-brown rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 relative">
        <div className="flex items-end gap-3 rounded-2xl border hairline bg-white p-3 focus-within:border-brown transition-colors">
          <Sparkles className="w-5 h-5 text-brown mb-3 ml-2" />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask VEQ anything about your work, meetings, tasks, documents..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:outline-none resize-none text-brown placeholder:text-muted py-3 max-h-32"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="mb-1 p-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-muted text-center mt-2 font-mono">
          Powered by Gemini AI • Connected to all your workspace data
        </p>
      </div>
    </section>
  )
}