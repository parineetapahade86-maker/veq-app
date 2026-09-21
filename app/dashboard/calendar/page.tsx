"use client"

import { useState, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, Users, Plus, Search } from "lucide-react"

// Define the structure of a Meeting/Event
interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
}

export default function CalendarPage() {
  // Start with an empty list. No fake data!
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    // In a real app, this would fetch from Supabase.
    // For now, it stays empty until we connect the backend fully.
    setMeetings([])
  }, [])

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort meetings by date (most recent first)
  const sortedMeetings = [...filteredMeetings].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Calendar
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Calendar
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Your schedule, synced and connected to the work behind every event.
      </p>

      {/* Action Bar: Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search events..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown placeholder:text-muted transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/meetings'}
          className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Schedule Meeting
        </button>
      </div>

      {/* Calendar View / List */}
      <div className="space-y-4">
        {sortedMeetings.length > 0 ? (
          sortedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brown/50 transition-all group"
            >
              {/* Left: Date & Info */}
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-xl bg-brown/10 flex flex-col items-center justify-center text-brown group-hover:bg-brown group-hover:text-cream-deep transition-colors">
                  <span className="text-xs font-mono uppercase">
                    {new Date(meeting.date).toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-display italic">
                    {new Date(meeting.date).getDate()}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-xl text-brown italic">
                    {meeting.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted" />
                      <span className="text-sm text-muted font-mono">{meeting.time || 'All Day'}</span>
                    </div>
                    {meeting.attendees.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-muted" />
                        <span className="text-sm text-muted font-mono">{meeting.attendees.length} attendees</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            <CalendarIcon className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-brown font-display text-xl italic mb-2">
              {searchQuery ? "No events match your search." : "Your calendar is empty."}
            </p>
            <p className="text-sm text-muted">
              {searchQuery ? "Try adjusting your search query." : "Schedule a meeting to see it here."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}