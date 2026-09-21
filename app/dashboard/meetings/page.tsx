"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import {
  Video, Plus, Search, Calendar, Clock, Users, X, Save, Trash2,
  FileText, Loader2, AlertCircle, Sparkles
} from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
  notes: string
  extractedData?: {
    decisions: string[]
    action_items: { task: string; assignee: string }[]
    important_dates: string[]
    responsible_persons: string[]
  }
  created_at: string
}

export default function MeetingsPage() {
  const { user } = useUser()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractedPreview, setExtractedPreview] = useState<any>(null)

  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    attendees: [] as string[],
    notes: ""
  })

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  const fetchMeetings = async () => {
    setLoading(true)
    setError("")
    try {
      // Get user's company_id
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single()

      if (profileError || !profile) {
        console.error("Profile error:", profileError)
        throw new Error("Failed to get company info")
      }

      // Fetch meetings from employee_knowledge table
      const { data, error: fetchError } = await supabase
        .from("employee_knowledge")
        .select("*")
        .eq("company_id", profile.company_id)
        .eq("source_type", "meeting")
        .order("created_at", { ascending: false })

      if (fetchError) {
        console.error("Fetch error:", fetchError)
        throw new Error(fetchError.message)
      }

      // Transform data to Meeting format
      const meetingsData = (data || []).map((item: any) => ({
        id: item.id,
        title: item.source_reference || "Untitled Meeting",
        date: new Date(item.created_at).toISOString().split('T')[0],
        time: new Date(item.created_at).toLocaleTimeString(),
        attendees: item.metadata?.attendees || [],
        notes: item.content || "",
        extractedData: item.metadata?.extracted || null,
        created_at: item.created_at
      }))

      setMeetings(meetingsData)
    } catch (err: any) {
      console.error("Error fetching meetings:", err)
      setError(err.message || "Network error while loading meetings")
    } finally {
      setLoading(false)
    }
  }

  const handleExtractKnowledge = async () => {
    if (!newMeeting.notes.trim()) {
      alert("Please add meeting notes first!")
      return
    }

    setIsExtracting(true)
    try {
      const res = await fetch("/api/meetings/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meetingTitle: newMeeting.title || "Untitled Meeting",
          rawNotes: newMeeting.notes
        }),
      })
      const data = await res.json()

      if (data.success) {
        setExtractedPreview(data.extracted)
      } else {
        alert("AI Extraction failed: " + (data.error || "Unknown error"))
      }
    } catch (err) {
      alert("Network error during AI extraction")
    } finally {
      setIsExtracting(false)
    }
  }

  const handleSaveMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date) {
      alert("Title and Date are required!")
      return
    }

    try {
      // Get company_id
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single()

      if (profileError || !profile?.company_id) {
        alert("Failed to find user profile or company information.")
        return
      }

      // Save to employee_knowledge table
      const { error } = await supabase
        .from("employee_knowledge")
        .insert({
          employee_id: user?.id,
          company_id: profile.company_id,
          source_type: "meeting",
          source_reference: newMeeting.title,
          content: newMeeting.notes,
          metadata: {
            attendees: newMeeting.attendees,
            extracted: extractedPreview,
            date: newMeeting.date,
            time: newMeeting.time
          }
        })

      if (error) throw error

      // Reset and refresh
      setNewMeeting({ title: "", date: "", time: "", attendees: [], notes: "" })
      setExtractedPreview(null)
      setIsFormOpen(false)
      fetchMeetings()
    } catch (err: any) {
      alert("Failed to save meeting: " + err.message)
    }
  }

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Delete this meeting?")) return
    try {
      const { error } = await supabase
        .from("employee_knowledge")
        .delete()
        .eq("id", id)

      if (error) throw error
      fetchMeetings()
    } catch (err) {
      alert("Failed to delete meeting")
    }
  }

  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.attendees.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  if (loading) {
    return (
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-[#806B58]">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-mono text-sm">Loading meetings...</span>
        </div>
      </section>
    )
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
        Workspace · Meetings
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
        Meeting Intelligence
      </h1>
      <p className="text-[#806B58] max-w-xl mb-12">
        Meeting notes, recordings, and decisions — captured automatically and kept searchable.
      </p>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 flex items-center justify-between">
          <p className="font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
          <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search and Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#806B58]" />
          <input
            type="text"
            placeholder="Search by title, notes, or attendees..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9DED0] bg-white/50 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-2xl hover:bg-[#4A2F20] transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Meeting
        </button>
      </div>

      {/* Add Meeting Form */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-[#3A2418] italic">New Meeting</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-[#806B58] hover:text-[#3A2418]">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-[#806B58] mb-2">MEETING TITLE *</label>
              <input
                type="text"
                name="title"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Weekly Team Sync"
                className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-[#806B58] mb-2">DATE *</label>
                <input
                  type="date"
                  name="date"
                  value={newMeeting.date}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#806B58] mb-2">TIME</label>
                <input
                  type="time"
                  name="time"
                  value={newMeeting.time}
                  onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-mono text-[#806B58]">MEETING NOTES / TRANSCRIPT</label>
                <button
                  type="button"
                  onClick={handleExtractKnowledge}
                  disabled={isExtracting || !newMeeting.notes.trim()}
                  className="text-xs font-mono text-[#3A2418] hover:text-[#C6A15B] flex items-center gap-1 disabled:opacity-50 transition-colors"
                >
                  {isExtracting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {isExtracting ? "AI analyzing..." : "✨ AI Extract"}
                </button>
              </div>
              <textarea
                name="notes"
                value={newMeeting.notes}
                onChange={(e) => setNewMeeting(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Paste raw notes or Zoom transcript here..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none"
              />
            </div>

            {extractedPreview && (
              <div className="rounded-xl border border-[#C6A15B]/30 bg-[#C6A15B]/5 p-4">
                <p className="text-xs font-mono text-[#806B58] mb-2 flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-[#C6A15B]" /> AI Extracted Preview
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {extractedPreview.decisions?.length > 0 && (
                    <div><span className="font-mono text-xs">DECISIONS:</span> {extractedPreview.decisions.join(", ")}</div>
                  )}
                  {extractedPreview.action_items?.length > 0 && (
                    <div><span className="font-mono text-xs">ACTIONS:</span> {extractedPreview.action_items.map((a: any) => a.task).join(", ")}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418]">
              Cancel
            </button>
            <button
              onClick={handleSaveMeeting}
              className="px-6 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Meeting
            </button>
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-6">
        {filteredMeetings.length > 0 ? (
          filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6 hover:border-[#C6A15B]/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-[#3A2418] italic mb-2">
                    {meeting.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#806B58]" />
                      <span className="text-sm text-[#3A2418] font-mono">
                        {new Date(meeting.date).toLocaleDateString('en-US', {
                          weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    {meeting.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#806B58]" />
                        <span className="text-sm text-[#3A2418] font-mono">{meeting.time}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="p-2 text-[#806B58] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {meeting.attendees.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[#806B58]" />
                    <span className="text-xs font-mono text-[#806B58]">ATTENDEES</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meeting.attendees.map((attendee, idx) => (
                      <span key={idx} className="px-3 py-1 bg-[#3A2418]/10 text-[#3A2418] rounded-full text-xs font-mono">
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {meeting.notes && (
                <div className="mt-4 pt-4 border-t border-[#E9DED0]">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-[#806B58] mt-1" />
                    <div className="flex-1">
                      <p className="text-xs font-mono text-[#806B58] mb-2">NOTES</p>
                      <p className="text-sm text-[#3A2418] whitespace-pre-wrap leading-relaxed">
                        {meeting.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {meeting.extractedData && (
                <div className="mt-6 pt-6 border-t border-[#E9DED0]">
                  <h4 className="font-display text-lg text-[#3A2418] italic mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#C6A15B]" /> AI Extracted Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {meeting.extractedData.decisions?.length > 0 && (
                      <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-4">
                        <p className="text-xs font-mono text-[#806B58] mb-2">DECISIONS</p>
                        <ul className="space-y-2">
                          {meeting.extractedData.decisions.map((d: string, i: number) => (
                            <li key={i} className="text-sm text-[#3A2418] flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> {d}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {meeting.extractedData.action_items?.length > 0 && (
                      <div className="rounded-xl border border-[#E9DED0] bg-white/60 p-4">
                        <p className="text-xs font-mono text-[#806B58] mb-2">ACTION ITEMS</p>
                        <ul className="space-y-2">
                          {meeting.extractedData.action_items.map((a: any, i: number) => (
                            <li key={i} className="text-sm text-[#3A2418] flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C6A15B] shrink-0" />
                              <div>
                                <span className="font-medium">{a.task}</span>
                                {a.assignee && a.assignee !== 'Unassigned' && (
                                  <span className="block text-xs text-[#806B58] mt-0.5">→ {a.assignee}</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center">
            <Video className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
            <p className="text-[#3A2418] font-display text-xl italic mb-2">
              {searchQuery ? "No meetings match your search." : "No meetings yet."}
            </p>
            <p className="text-sm text-[#806B58]">
              {searchQuery ? "Try adjusting your search query." : "Click 'Add Meeting' to get started."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}