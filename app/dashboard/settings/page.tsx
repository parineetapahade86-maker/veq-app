"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { User, Mail, Building2, Bell, Shield, Trash2, Save, Check, Loader2 } from "lucide-react"

export default function SettingsPage() {
  // Get REAL user data from Clerk
  const { user, isLoaded } = useUser()

  // Local state for settings
  const [workspaceName, setWorkspaceName] = useState("My VEQ Workspace")
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyDigest: true
  })
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")

  // Handle notification toggles
  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Mock save function (Shows a success message)
  const handleSave = () => {
    setIsSaving(true)
    setSaveMessage("")

    // Simulate API call delay
    setTimeout(() => {
      setIsSaving(false)
      setSaveMessage("Settings saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    }, 1000)
  }

  // Loading state while Clerk fetches user
  if (!isLoaded) {
    return (
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brown animate-spin" />
      </section>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        System · Settings
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Settings
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Manage your account, workspace preferences, and notifications.
      </p>

      {/* Success Message */}
      {saveMessage && (
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 text-green-800 font-mono text-sm animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          {saveMessage}
        </div>
      )}

      <div className="space-y-8">

        {/* 1. PROFILE SECTION (REAL DATA FROM CLERK) */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-brown" />
            <h2 className="font-display text-2xl text-brown italic">Profile</h2>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Real Profile Picture from Clerk - FIXED SIZE */}
            <div className="w-16 h-16 rounded-full bg-brown/10 overflow-hidden border hairline flex items-center justify-center shrink-0">
              {user?.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-brown" />
              )}
            </div>

            <div className="flex-1 space-y-4 w-full">
              <div>
                <label className="block text-xs font-mono text-muted mb-2">FULL NAME</label>
                <div className="px-4 py-3 rounded-xl border hairline bg-white/50 text-brown font-medium">
                  {user?.fullName || "User Name"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-2">EMAIL ADDRESS</label>
                <div className="px-4 py-3 rounded-xl border hairline bg-white/50 text-brown font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" />
                  {user?.primaryEmailAddress?.emailAddress || "No email found"}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted mt-4 font-mono">
            To change your name or email, please update your profile via the user menu in the top right corner.
          </p>
        </div>

        {/* 2. WORKSPACE SETTINGS */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-brown" />
            <h2 className="font-display text-2xl text-brown italic">Workspace</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">WORKSPACE NAME</label>
              <input
                type="text"
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>
          </div>
        </div>

        {/* 3. NOTIFICATIONS (UI ONLY - Backend needed for real notifications) */}
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-brown" />
            <h2 className="font-display text-2xl text-brown italic">Notifications</h2>
          </div>

          <div className="space-y-4">
            {/* Email Notifications */}
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border hairline">
              <div>
                <h3 className="font-medium text-brown">Email Notifications</h3>
                <p className="text-xs text-muted mt-1">Receive updates about your tasks and meetings.</p>
              </div>
              <button
                onClick={() => toggleNotification('email')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-brown' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications.email ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Push Notifications */}
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border hairline">
              <div>
                <h3 className="font-medium text-brown">Push Notifications</h3>
                <p className="text-xs text-muted mt-1">Get instant alerts in your browser.</p>
              </div>
              <button
                onClick={() => toggleNotification('push')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-brown' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications.push ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>

            {/* Weekly Digest */}
            <div className="flex items-center justify-between p-4 bg-white/50 rounded-xl border hairline">
              <div>
                <h3 className="font-medium text-brown">Weekly AI Digest</h3>
                <p className="text-xs text-muted mt-1">Get an AI summary of your team's work every Monday.</p>
              </div>
              <button
                onClick={() => toggleNotification('weeklyDigest')}
                className={`w-12 h-6 rounded-full transition-colors relative ${notifications.weeklyDigest ? 'bg-brown' : 'bg-gray-300'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${notifications.weeklyDigest ? 'translate-x-7' : 'translate-x-1'}`}></div>
              </button>
            </div>
          </div>
        </div>

        {/* 4. DANGER ZONE */}
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-red-600" />
            <h2 className="font-display text-2xl text-red-800 italic">Danger Zone</h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-red-800">Delete Workspace</h3>
              <p className="text-xs text-red-600/80 mt-1">Permanently delete all your data, employees, and documents.</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 font-mono text-sm font-semibold">
              <Trash2 className="w-4 h-4" />
              Delete Workspace
            </button>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </div>
    </section>
  )
}