"use client"

import { useState, useEffect } from "react"
import { Plug, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@/utils/supabase/client"

export default function PluginsPage() {
  const { user } = useUser()
  const [connectedApps, setConnectedApps] = useState({
    github: false,
    slack: false,
    google: false,
    notion: false,
    linear: false,
    jira: false,
    zoom: false,
    asana: false,
    zendesk: false // 👈 ADDED ZENDESK HERE
  })

  useEffect(() => {
    async function checkConnections() {
      if (!user) return

      const supabase = createClient()

      const { data } = await supabase
        .from('user_integrations')
        .select('provider')
        .eq('user_id', user.id)

      if (data) {
        setConnectedApps({
          github: data.some(app => app.provider === 'github'),
          slack: data.some(app => app.provider === 'slack'),
          google: data.some(app => app.provider === 'google'),
          notion: data.some(app => app.provider === 'notion'),
          linear: data.some(app => app.provider === 'linear'),
          jira: data.some(app => app.provider === 'jira'),
          zoom: data.some(app => app.provider === 'zoom'),
          asana: data.some(app => app.provider === 'asana'),
          zendesk: data.some(app => app.provider === 'zendesk') // 👈 ADDED ZENDESK CHECK HERE
        })
      }
    }

    checkConnections()
  }, [user])

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Integrations · Plugins
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Plugins
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Connect the tools your team already uses so VEQ can capture context
        directly from them.
      </p>

      {/* GitHub Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              GitHub
            </h3>
            <p className="text-muted mb-4">
              Connect your GitHub repositories to track commits, pull requests, and code reviews.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.github ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/github"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect GitHub
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Slack Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Slack
            </h3>
            <p className="text-muted mb-4">
              Connect your Slack workspace to read messages, channels, and team activity.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.slack ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/slack"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Slack
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Google Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Google (Calendar & Drive)
            </h3>
            <p className="text-muted mb-4">
              Connect your Google account to sync your Calendar events and Drive documents.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.google ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/google"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Google
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Notion Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Notion (Knowledge Base)
            </h3>
            <p className="text-muted mb-4">
              Connect your Notion workspace to access documents, databases, and company knowledge.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.notion ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/notion"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Notion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Linear Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Linear (Project Management)
            </h3>
            <p className="text-muted mb-4">
              Connect your Linear workspace to track issues, sprints, and project progress.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.linear ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/linear"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Linear
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Jira Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Jira (Project Management)
            </h3>
            <p className="text-muted mb-4">
              Connect your Jira workspace to track issues, sprints, and bugs.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.jira ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/jira"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Jira
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Zoom Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Zoom (Meeting Intelligence)
            </h3>
            <p className="text-muted mb-4">
              Connect your Zoom account to access meeting recordings, transcripts, and generate AI summaries.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.zoom ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/zoom"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Zoom
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Asana Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Asana (Project Management)
            </h3>
            <p className="text-muted mb-4">
              Connect your Asana workspace to track tasks, projects, and team progress.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.asana ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/asana"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Asana
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* NEW: Zendesk Integration Card */}
      <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-brown italic mb-2">
              Zendesk (Customer Support)
            </h3>
            <p className="text-muted mb-4">
              Connect your Zendesk account to read support tickets, user data, and organization details.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted">
              <Plug className="w-4 h-4" />
              <span>Custom OAuth Integration</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {connectedApps.zendesk ? (
              <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-800 rounded-2xl font-mono text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Connected
              </div>
            ) : (
              <Link
                href="/api/auth/zendesk"
                className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
              >
                Connect Zendesk
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Coming Soon Card (Updated) */}
      <div className="rounded-2xl border hairline border-dashed border-cream-deep p-8">
        <div className="flex items-start justify-between opacity-50">
          <div className="flex-1">
            <h3 className="font-display text-2xl text-muted italic mb-2">
              More Integrations Coming Soon
            </h3>
            <p className="text-muted">
              Microsoft Teams, Dropbox, and more will be available soon.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}