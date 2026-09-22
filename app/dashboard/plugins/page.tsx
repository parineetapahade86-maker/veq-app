"use client"

import { useState, useEffect } from "react"
import {
  Plug,
  CheckCircle2,
  MessageSquare,
  Calendar,
  FileText,
  Video,
  ListTodo,
  Headphones,
  Plus,
  X,
  Loader2,
  AlertCircle
} from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/utils/supabase/client"

type Plugin = {
  id: string
  name: string
  description: string
  icon: React.ElementType
  category: "popular" | "productivity"
  connectionType: "oauth" | "webhook"
}

const allPlugins: Plugin[] = [
  {
    id: "slack",
    name: "Slack",
    description: "Read messages, channels, and team activity via Webhooks.",
    icon: MessageSquare,
    category: "popular",
    connectionType: "webhook"
  },
  {
    id: "google",
    name: "Google (Calendar & Drive)",
    description: "Sync Calendar events and Drive documents.",
    icon: Calendar,
    category: "popular",
    connectionType: "oauth"
  },
  {
    id: "notion",
    name: "Notion",
    description: "Access documents, databases, and company knowledge.",
    icon: FileText,
    category: "popular",
    connectionType: "oauth"
  },
  {
    id: "linear",
    name: "Linear",
    description: "Track issues, sprints, and project progress.",
    icon: ListTodo,
    category: "productivity",
    connectionType: "oauth"
  },
  {
    id: "jira",
    name: "Jira",
    description: "Track issues, sprints, and bugs.",
    icon: ListTodo,
    category: "productivity",
    connectionType: "oauth"
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Access meeting recordings, transcripts, and AI summaries.",
    icon: Video,
    category: "productivity",
    connectionType: "oauth"
  },
  {
    id: "zendesk",
    name: "Zendesk",
    description: "Read support tickets, user data, and organization details.",
    icon: Headphones,
    category: "productivity",
    connectionType: "oauth"
  }
]

export default function PluginsPage() {
  const { user } = useUser()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [connectedApps, setConnectedApps] = useState<Set<string>>(new Set())

  // Modal State
  const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) fetchConnections()
  }, [user])

  const fetchConnections = async () => {
    try {
      // 1. Get Company ID using clerk_id
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("clerk_id", user?.id)
        .single()

      if (!profile?.company_id) return
      setCompanyId(profile.company_id)

      // 2. Fetch enabled integrations for this company
      const { data } = await supabase
        .from("company_integrations")
        .select("integration_type")
        .eq("company_id", profile.company_id)
        .eq("is_enabled", true)

      if (data) {
        const connected = new Set(data.map((item: any) => item.integration_type))
        setConnectedApps(connected)
      }
    } catch (error) {
      console.error("Error fetching plugin connections:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    if (!companyId || !selectedPlugin) return

    // For webhook type, ensure URL is provided
    if (selectedPlugin.connectionType === "webhook" && !webhookUrl.trim()) {
      alert("Please enter a valid Webhook URL.")
      return
    }

    setIsSaving(true)
    try {
      const { error } = await supabase
        .from("company_integrations")
        .upsert({
          company_id: companyId,
          integration_type: selectedPlugin.id,
          is_enabled: true,
          config: selectedPlugin.connectionType === "webhook" ? { webhook_url: webhookUrl } : {}
        }, { onConflict: "company_id, integration_type" })

      if (error) throw error

      // Update local state to reflect the new connection immediately
      setConnectedApps(prev => new Set(prev).add(selectedPlugin.id))
      setSelectedPlugin(null)
      setWebhookUrl("")

    } catch (err: any) {
      console.error("Connection error:", err)
      alert(err.message || "Failed to connect. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const installed = allPlugins.filter(p => connectedApps.has(p.id))
  const popular = allPlugins.filter(p => p.category === "popular" && !connectedApps.has(p.id))
  const productivity = allPlugins.filter(p => p.category === "productivity" && !connectedApps.has(p.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#C6A15B]" />
      </div>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Integrations · Plugins
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Plugins
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Connect the tools your team already uses so VEQ can capture context directly from them.
      </p>

      {/* INSTALLED SECTION */}
      {installed.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="font-display text-2xl text-brown italic">Installed</h2>
            <span className="text-xs font-mono text-brown bg-gold/20 px-2 py-1 rounded-full">
              {installed.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {installed.map((plugin) => {
              const Icon = plugin.icon
              return (
                <div
                  key={plugin.id}
                  className="w-14 h-14 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center hover:bg-gold/30 transition-colors cursor-pointer group relative"
                  title={`${plugin.name} (Connected)`}
                >
                  <Icon className="w-7 h-7 text-brown group-hover:scale-110 transition-transform" />
                  <CheckCircle2 className="w-4 h-4 text-green-600 absolute -top-1 -right-1 bg-white rounded-full border border-gold/30" />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* POPULAR SECTION */}
      {popular.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-brown italic mb-6">Popular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popular.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onConnect={() => setSelectedPlugin(plugin)}
              />
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTIVITY SECTION */}
      {productivity.length > 0 && (
        <div className="mb-12">
          <h2 className="font-display text-2xl text-brown italic mb-6">Productivity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {productivity.map((plugin) => (
              <PluginCard
                key={plugin.id}
                plugin={plugin}
                onConnect={() => setSelectedPlugin(plugin)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border hairline border-dashed border-cream-deep p-8 text-center">
        <p className="text-sm text-muted font-mono">
          GitHub, Microsoft Teams, Dropbox, and more custom integrations coming soon...
        </p>
      </div>

      {/* ✅ UPDATED CONNECTION MODAL WITH ACTUAL OAUTH REDIRECT ✅ */}
      {selectedPlugin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-[#F4EDE1] rounded-2xl border hairline p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center">
                  <selectedPlugin.icon className="w-5 h-5 text-brown" />
                </div>
                <h3 className="font-display text-2xl text-brown italic">
                  Connect {selectedPlugin.name}
                </h3>
              </div>
              <button
                onClick={() => { setSelectedPlugin(null); setWebhookUrl(""); }}
                className="text-muted hover:text-brown transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedPlugin.connectionType === "webhook" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-mono text-muted mb-2">
                    Incoming Webhook URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://hooks.slack.com/services/T00/B00/XXX"
                    className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 text-brown"
                  />
                  <p className="text-xs text-muted mt-2">
                    Paste the webhook URL generated from your {selectedPlugin.name} workspace settings.
                  </p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => { setSelectedPlugin(null); setWebhookUrl(""); }}
                    className="flex-1 py-3 border hairline rounded-xl text-brown hover:bg-brown/5 transition-colors font-mono text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnect}
                    disabled={isSaving || !webhookUrl.trim()}
                    className="flex-1 py-3 bg-brown text-cream rounded-xl hover:bg-brown-deep transition-colors font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    {isSaving ? "Connecting..." : "Connect"}
                  </button>
                </div>
              </div>
            ) : (
              // ✅ YE HAI ACTUAL OAUTH FIX! Ab ye seedha API route par le jayega
              <div className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-gold mx-auto mb-4" />
                <p className="text-muted mb-6 leading-relaxed">
                  You are about to connect your <strong className="text-brown">{selectedPlugin.name}</strong> account. You will be redirected to authorize VEQ.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => { setSelectedPlugin(null); setWebhookUrl(""); }}
                    className="px-6 py-3 border hairline rounded-xl text-brown hover:bg-brown/5 transition-colors font-mono text-sm font-semibold"
                  >
                    Cancel
                  </button>
                  <a
                    href={`/api/auth/${selectedPlugin.id}`}
                    className="px-8 py-3 bg-brown text-cream rounded-xl hover:bg-brown-deep transition-colors font-mono text-sm font-semibold flex items-center gap-2"
                  >
                    <Plug className="w-4 h-4" />
                    Connect {selectedPlugin.name}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}

// Reusable Plugin Card Component
function PluginCard({ plugin, onConnect }: { plugin: Plugin; onConnect: () => void }) {
  const Icon = plugin.icon
  return (
    <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-gold/50 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold/20 border border-gold/30 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-brown" />
          </div>
          <div>
            <h3 className="font-display text-lg text-brown italic">{plugin.name}</h3>
            <p className="text-sm text-muted mt-1">{plugin.description}</p>
          </div>
        </div>
        <button
          onClick={onConnect}
          className="p-2 text-muted hover:text-brown hover:bg-brown/5 rounded-lg transition-colors shrink-0"
          title="Connect"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted font-mono mt-4 pt-4 border-t hairline">
        <Plug className="w-3 h-3" />
        <span>{plugin.connectionType === "webhook" ? "Webhook Integration" : "Custom OAuth Integration"}</span>
      </div>
    </div>
  )
}