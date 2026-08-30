"use client"

import { useState } from "react"
import { Video, Plus, Search, Calendar, Clock, Users, X, Save, Trash2, FileText } from "lucide-react"

// Define the structure of a Meeting
interface Meeting {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
  notes: string
}

// Mock employees list (In real app, this will come from /employees page)
const availableEmployees = [
  { id: "1", name: "You" }
]

export default function MeetingsPage() {
  // Start with an empty list. No fake data!
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // State to control the "Add Meeting" form
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State to hold the new meeting's details
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    date: "",
    time: "",
    attendees: [] as string[],
    notes: ""
  })

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewMeeting(prev => ({ ...prev, [name]: value }))
  }

  // Handle attendee selection
  const handleAttendeeToggle = (employeeName: string) => {
    setNewMeeting(prev => {
      const attendees = prev.attendees.includes(employeeName)
        ? prev.attendees.filter(name => name !== employeeName)
        : [...prev.attendees, employeeName]
      return { ...prev, attendees }
    })
  }

  // Save the new meeting to the list
  const handleSaveMeeting = () => {
    if (!newMeeting.title || !newMeeting.date) {
      alert("Title and Date are required!")
      return
    }

    const meeting: Meeting = {
      id: Date.now().toString(), // Generate a unique ID
      ...newMeeting
    }

    setMeetings([...meetings, meeting])

    // Reset form and close it
    setNewMeeting({ title: "", date: "", time: "", attendees: [], notes: "" })
    setIsFormOpen(false)
  }

  // Delete a meeting from the list
  const handleDeleteMeeting = (id: string) => {
    setMeetings(meetings.filter(meeting => meeting.id !== id))
  }

  // Filter meetings based on search query
  const filteredMeetings = meetings.filter(meeting =>
    meeting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
    meeting.attendees.some(attendee => attendee.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  // Sort meetings by date (most recent first)
  const sortedMeetings = [...filteredMeetings].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Meetings
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Meetings
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Meeting notes, recordings, and decisions — captured automatically and kept searchable.
      </p>

      {/* Action Bar: Search + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by title, notes, or attendees..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown placeholder:text-muted transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Meeting
        </button>
      </div>

      {/* Add Meeting Form (Shows only when isFormOpen is true) */}
      {isFormOpen && (
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-brown italic">New Meeting</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-brown">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">MEETING TITLE *</label>
              <input
                type="text"
                name="title"
                value={newMeeting.title}
                onChange={handleInputChange}
                placeholder="e.g. Weekly Team Sync"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono text-muted mb-2">DATE *</label>
                <input
                  type="date"
                  name="date"
                  value={newMeeting.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted mb-2">TIME</label>
                <input
                  type="time"
                  name="time"
                  value={newMeeting.time}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-3">ATTENDEES</label>
              <div className="rounded-xl border hairline bg-white/50 p-4 space-y-2">
                {availableEmployees.map((employee) => (
                  <label
                    key={employee.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={newMeeting.attendees.includes(employee.name)}
                      onChange={() => handleAttendeeToggle(employee.name)}
                      className="w-4 h-4 rounded border-brown text-brown focus:ring-brown"
                    />
                    <span className="text-brown text-sm">{employee.name}</span>
                  </label>
                ))}
                <p className="text-xs text-muted italic mt-2">
                  (More employees will appear here once you add them in the Employees page)
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">MEETING NOTES</label>
              <textarea
                name="notes"
                value={newMeeting.notes}
                onChange={handleInputChange}
                placeholder="Key discussion points, decisions made, action items..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown resize-none"
              />
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
              onClick={handleSaveMeeting}
              className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Meeting
            </button>
          </div>
        </div>
      )}

      {/* Meetings List */}
      <div className="space-y-4">
        {sortedMeetings.length > 0 ? (
          sortedMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-brown/50 transition-all group"
            >
              {/* Header: Title & Actions */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-2xl text-brown italic mb-2">
                    {meeting.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted" />
                      <span className="text-sm text-brown font-mono">
                        {new Date(meeting.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    {meeting.time && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted" />
                        <span className="text-sm text-brown font-mono">{meeting.time}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Attendees */}
              {meeting.attendees.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-muted" />
                    <span className="text-xs font-mono text-muted">ATTENDEES</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {meeting.attendees.map((attendee, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-brown/10 text-brown rounded-full text-xs font-mono"
                      >
                        {attendee}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {meeting.notes && (
                <div className="mt-4 pt-4 border-t hairline border-brown/10">
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted mt-1" />
                    <div>
                      <p className="text-xs font-mono text-muted mb-2">NOTES</p>
                      <p className="text-sm text-brown whitespace-pre-wrap leading-relaxed">
                        {meeting.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            {/* Empty State */}
            <Video className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-brown font-display text-xl italic mb-2">
            {searchQuery ? "No meetings match your search." : "No meetings yet."}
          </p>
          <p className="text-sm text-muted">
            {searchQuery ? "Try adjusting your search query." : "Click 'Add Meeting' to get started."}
          </p>
        </div>
        )}
      </div>
    </section>
  )
}