"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Mic, Loader2, CheckCircle2, Users, FileAudio, Upload, AlertTriangle, GitBranch, Brain, FileText } from "lucide-react"

export default function MeetingIntelligencePage() {
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [success, setSuccess] = useState(false)
    const [summary, setSummary] = useState<any>(null)
    const [errorMsg, setErrorMsg] = useState("")
    const [inputMode, setInputMode] = useState<'file' | 'text'>('file') // Toggle between File and Text

    const [formData, setFormData] = useState({
        meetingTitle: "",
        date: new Date().toISOString().split('T')[0],
        participants: "",
        file: null as File | null,
        transcript: ""
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0], transcript: "" })
            setErrorMsg("")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMsg("")

        if (!formData.meetingTitle) {
            setErrorMsg("Please provide a meeting title.")
            return
        }
        if (inputMode === 'file' && !formData.file) {
            setErrorMsg("Please upload an audio/video file.")
            return
        }
        if (inputMode === 'text' && !formData.transcript.trim()) {
            setErrorMsg("Please paste a meeting transcript.")
            return
        }

        setLoading(true)
        setUploadProgress(10)

        try {
            const data = new FormData()
            data.append('meetingTitle', formData.meetingTitle)
            data.append('date', formData.date)
            data.append('participants', formData.participants)
            data.append('inputMode', inputMode)

            if (inputMode === 'file' && formData.file) {
                data.append('file', formData.file)
            } else {
                data.append('transcript', formData.transcript)
            }

            setUploadProgress(30)

            const res = await fetch('/api/meeting-intelligence', {
                method: 'POST',
                body: data
            })

            setUploadProgress(80)
            const result = await res.json()

            if (result.success) {
                setSummary(result.summary)
                setSuccess(true)
                setUploadProgress(100)
            } else {
                setErrorMsg(result.error || "Failed to process meeting intelligence.")
            }
        } catch (err) {
            console.error(err)
            setErrorMsg("An error occurred. Please try again.")
        } finally {
            setLoading(false)
            setUploadProgress(0)
        }
    }

    // ✅ SUCCESS STATE
    if (success && summary) {
        return (
            <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="font-display text-4xl text-brown italic mb-4">Meeting Intelligence Captured!</h1>
                    <p className="text-muted max-w-xl mx-auto">
                        VEQ has analyzed the input and automatically populated the Company Memory Graph.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                        <Brain className="w-6 h-6 text-brown mx-auto mb-2" />
                        <p className="font-display text-2xl text-brown font-bold">{summary.nodesCreated}</p>
                        <p className="text-xs text-muted uppercase tracking-wider">Nodes Created</p>
                    </div>
                    <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                        <GitBranch className="w-6 h-6 text-brown mx-auto mb-2" />
                        <p className="font-display text-2xl text-brown font-bold">{summary.edgesCreated}</p>
                        <p className="text-xs text-muted uppercase tracking-wider">Connections Made</p>
                    </div>
                    <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                        <FileText className="w-6 h-6 text-brown mx-auto mb-2" />
                        <p className="font-display text-2xl text-brown font-bold">{summary.decisions}</p>
                        <p className="text-xs text-muted uppercase tracking-wider">Decisions Logged</p>
                    </div>
                    <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                        <AlertTriangle className="w-6 h-6 text-brown mx-auto mb-2" />
                        <p className="font-display text-2xl text-brown font-bold">{summary.risks}</p>
                        <p className="text-xs text-muted uppercase tracking-wider">Risks Identified</p>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => {
                            setSuccess(false);
                            setSummary(null);
                            setFormData({ meetingTitle: "", date: new Date().toISOString().split('T')[0], participants: "", file: null, transcript: "" });
                            setInputMode('file');
                        }}
                        className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors font-mono text-sm font-semibold"
                    >
                        Process Another Meeting
                    </button>
                </div>
            </section>
        )
    }

    // ✅ FORM STATE (Hybrid: File Upload + Text Fallback)
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Intelligence · Auto-Transcription Engine
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Meeting Intelligence
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Drop your meeting recording for 0-minute auto-transcription, or paste an existing transcript. VEQ will build the memory graph automatically.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Meeting Title *</label>
                        <input
                            type="text"
                            value={formData.meetingTitle}
                            onChange={(e) => setFormData({ ...formData, meetingTitle: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                            placeholder="e.g., Q4 Product Launch Sync"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3" /> Participants (Optional, Comma Separated)
                    </label>
                    <input
                        type="text"
                        value={formData.participants}
                        onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                        placeholder="e.g., Rohan, Priya, David"
                    />
                </div>

                {/* 🔥 INPUT MODE TOGGLE */}
                <div className="flex gap-4 mb-2">
                    <button
                        type="button"
                        onClick={() => setInputMode('file')}
                        className={`flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${inputMode === 'file' ? 'bg-brown text-cream-deep' : 'bg-cream-deep text-muted hover:bg-cream-deep/80'}`}
                    >
                        <FileAudio className="w-4 h-4" /> Upload Recording (0 Mins)
                    </button>
                    <button
                        type="button"
                        onClick={() => setInputMode('text')}
                        className={`flex-1 py-2 rounded-lg font-mono text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${inputMode === 'text' ? 'bg-brown text-cream-deep' : 'bg-cream-deep text-muted hover:bg-cream-deep/80'}`}
                    >
                        <FileText className="w-4 h-4" /> Paste Transcript
                    </button>
                </div>

                {/* FILE UPLOAD ZONE */}
                {inputMode === 'file' && (
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest flex items-center gap-2">
                            <Mic className="w-3 h-3" /> Meeting Recording (Audio/Video) *
                        </label>
                        <div className="relative border-2 border-dashed border-brown/30 rounded-xl p-8 text-center hover:bg-cream-deep/40 transition-colors cursor-pointer bg-white/50">
                            <input
                                type="file"
                                accept="audio/*,video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-10 h-10 text-brown mx-auto mb-3" />
                            {formData.file ? (
                                <div>
                                    <p className="font-display text-lg text-brown italic">{formData.file.name}</p>
                                    <p className="text-xs text-muted mt-1">{(formData.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="font-display text-lg text-brown italic">Drop audio/video file here</p>
                                    <p className="text-xs text-muted mt-1">or click to browse (MP3, MP4, WAV, M4A)</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* TEXT TRANSCRIPT ZONE (Fallback) */}
                {inputMode === 'text' && (
                    <div>
                        <label className="block text-xs font-mono text-muted mb-2 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Raw Transcript *
                        </label>
                        <textarea
                            rows={12}
                            value={formData.transcript}
                            onChange={(e) => setFormData({ ...formData, transcript: e.target.value, file: null })}
                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown text-sm leading-relaxed"
                            placeholder="Paste the raw text/transcript of your meeting here..."
                        />
                    </div>
                )}

                {loading && (
                    <div className="w-full bg-cream-deep rounded-full h-2.5">
                        <div className="bg-brown h-2.5 rounded-full transition-all duration-500" style={{ width: `${uploadProgress}%` }}></div>
                        <p className="text-xs font-mono text-muted mt-2 text-center">
                            {inputMode === 'file' ? "Uploading & Transcribing Audio..." : "AI is Extracting Intelligence..."}
                        </p>
                    </div>
                )}

                {errorMsg && <p className="text-red-600 text-sm font-mono flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errorMsg}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-4 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                        </>
                    ) : (
                        <>
                            <Brain className="w-4 h-4" /> {inputMode === 'file' ? 'Auto-Transcribe & Build Graph' : 'Extract & Build Memory Graph'}
                        </>
                    )}
                </button>
            </form>
        </section>
    )
}