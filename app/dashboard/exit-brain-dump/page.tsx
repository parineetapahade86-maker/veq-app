"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import {
    FileText, Download, CheckCircle2, ArrowRight,
    ArrowLeft, Brain, Users, Mail, Loader2, X,
    GitBranch, AlertTriangle, Save, Mic, StopCircle, Upload, Volume2
} from "lucide-react"

export default function ExitBrainDumpPage() {
    const { user } = useUser()
    const router = useRouter()

    const [currentStep, setCurrentStep] = useState(0)
    const [isGenerating, setIsGenerating] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const [summary, setSummary] = useState<any>(null)

    // 🎙️ Voice recording state
    const [isRecording, setIsRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [recordingTime, setRecordingTime] = useState(0)

    const [formData, setFormData] = useState({
        employeeName: "",
        responsibilities: "",
        processes: "",
        decisions: "",
        unresolved: "",
        dependencies: "",
        manager_email: "",
    })

    const handleExit = () => {
        if (confirm("Are you sure you want to exit? Unsaved progress will be lost.")) {
            router.push("/dashboard")
        }
    }

    // ✅ Wizard Steps mapped to Backend Fields
    const steps = [
        {
            title: "Step 1: Employee Name",
            icon: <Users className="w-6 h-6" />,
            question: "Who is leaving the company?",
            fields: ["employeeName"],
        },
        {
            title: "Step 2: Key Responsibilities",
            icon: <Brain className="w-6 h-6" />,
            question: "What did you do on a daily/weekly basis?",
            placeholder: "e.g., Project Alpha - Backend API 80% complete. Access credentials are in LastPass...",
            fields: ["responsibilities"],
        },
        {
            title: "Step 3: Processes & SOPs",
            icon: <FileText className="w-6 h-6" />,
            question: "Any specific tools, workflows, or step-by-step processes?",
            placeholder: "e.g., After restarting the server, the cache needs to be cleared manually or the API fails...",
            fields: ["processes"],
        },
        {
            title: "Step 4: Key Decisions & Context",
            icon: <FileText className="w-6 h-6" />,
            question: "Why were certain vendors, tools, or strategies chosen?",
            placeholder: "e.g., We chose Supplier B because it was cheaper, but we need to monitor their delivery times...",
            fields: ["decisions"],
        },
        {
            title: "Step 5: Unresolved & Dependencies",
            icon: <AlertTriangle className="w-6 h-6" />,
            question: "What is left unfinished, and who are the hidden contacts/dependencies?",
            placeholder: "Unresolved: Renew SSL certificate.\nDependencies: For Client X, approvals need to go through Rahul...",
            fields: ["unresolved", "dependencies"],
        },
        {
            title: "Step 6: Voice Note or Submit",
            icon: <Mic className="w-6 h-6" />,
            question: "Would you like to record a voice note, or submit what you've typed?",
            isVoiceStep: true,
            fields: []
        },
    ]

    const currentStepData = steps[currentStep]

    // 🎙️ VOICE RECORDING FUNCTIONS
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
            mediaRecorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' })
                setAudioBlob(blob)
            }

            mediaRecorder.start()
            setIsRecording(true)
            setRecordingTime(0)

            const timer = setInterval(() => {
                setRecordingTime(prev => prev + 1)
            }, 1000)

                ; (window as any).mediaRecorder = mediaRecorder
                ; (window as any).recordingTimer = timer

        } catch (err) {
            console.error('Recording error:', err)
            setErrorMsg("Could not access microphone. Please allow microphone permissions.")
        }
    }

    const stopRecording = () => {
        const mediaRecorder = (window as any).mediaRecorder
        const timer = (window as any).recordingTimer

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop()
            mediaRecorder.stream.getTracks().forEach((track: MediaStreamTrack) => track.stop())
            setIsRecording(false)
            clearInterval(timer)
        }
    }

    const uploadRecording = async () => {
        if (!audioBlob) return

        setIsGenerating(true)
        try {
            const data = new FormData()
            data.append('employeeName', formData.employeeName)
            data.append('responsibilities', formData.responsibilities)
            data.append('processes', formData.processes)
            data.append('decisions', formData.decisions)
            data.append('unresolved', formData.unresolved)
            data.append('dependencies', formData.dependencies)
            data.append('manager_email', formData.manager_email)
            data.append('audioFile', audioBlob, 'voice-note.webm')
            data.append('useVoiceInput', 'true')

            const res = await fetch('/api/exit-brain-dump', {
                method: 'POST',
                body: data
            })

            const result = await res.json()
            if (result.success) {
                setSummary(result.summary)
                setIsCompleted(true)
            } else {
                setErrorMsg(result.error || "Failed to process voice note")
            }
        } catch (err) {
            console.error(err)
            setErrorMsg("Failed to upload recording")
        } finally {
            setIsGenerating(false)
        }
    }

    const handleNext = () => {
        if (currentStepData.isVoiceStep) {
            handleGenerateReport() // Fallback if they click next on voice step
            return
        }

        const isValid = currentStepData.fields.every(field => {
            const value = formData[field as keyof typeof formData]
            return value.trim().length > 0
        })

        if (!isValid) {
            setErrorMsg("Please fill in the required fields before moving on.")
            return
        }
        setErrorMsg("")
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePrev = () => {
        setErrorMsg("")
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleGenerateReport = async () => {
        if (!formData.employeeName.trim()) {
            setErrorMsg("Please enter the employee's name.")
            setCurrentStep(0)
            return
        }

        setIsGenerating(true)
        setErrorMsg("")

        try {
            const res = await fetch("/api/exit-brain-dump", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })
            const data = await res.json()

            if (!res.ok || !data.success) {
                throw new Error(data.error || "Failed to save your knowledge dump")
            }

            setSummary(data.summary)
            setIsCompleted(true)
        } catch (err) {
            console.error("Exit brain dump save error:", err)
            setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.")
        } finally {
            setIsGenerating(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // ✅ COMPLETED STATE: AI Summary + Printable Report
    if (isCompleted) {
        return (
            <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 relative">
                <button
                    onClick={handleExit}
                    className="absolute top-0 right-0 p-2 rounded-full hover:bg-cream-deep/60 transition-colors text-brown hover:text-brown/80"
                    title="Return to Dashboard"
                >
                    <X className="w-6 h-6" />
                </button>

                <div className="no-print text-center mb-10">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="font-display text-4xl text-brown italic mb-4">Knowledge Successfully Captured!</h1>
                    <p className="text-muted max-w-xl mx-auto mb-8">
                        VEQ AI has structured the brain dump into actionable company assets.
                    </p>

                    {/* 🔥 AI STRUCTURING SUMMARY */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
                        <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                            <FileText className="w-6 h-6 text-brown mx-auto mb-2" />
                            <p className="font-display text-2xl text-brown font-bold">{summary?.sopsCreated || 0}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">SOPs Created</p>
                        </div>
                        <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                            <Brain className="w-6 h-6 text-brown mx-auto mb-2" />
                            <p className="font-display text-2xl text-brown font-bold">{summary?.decisionsCaptured || 0}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">Decisions Logged</p>
                        </div>
                        <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                            <CheckCircle2 className="w-6 h-6 text-brown mx-auto mb-2" />
                            <p className="font-display text-2xl text-brown font-bold">{summary?.tasksGenerated || 0}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">Tasks Generated</p>
                        </div>
                        <div className="rounded-xl border hairline bg-white/60 p-4 text-center">
                            <GitBranch className="w-6 h-6 text-brown mx-auto mb-2" />
                            <p className="font-display text-2xl text-brown font-bold">{summary?.dependenciesMapped || 0}</p>
                            <p className="text-xs text-muted uppercase tracking-wider">Dependencies Mapped</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={() => window.print()}
                            className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF Checklist
                        </button>
                        <button
                            onClick={handleExit}
                            className="px-6 py-3 border hairline text-brown rounded-xl hover:bg-cream-deep/60 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
                        >
                            <X className="w-4 h-4" />
                            Close & Return to Dashboard
                        </button>
                    </div>
                </div>

                {/* Print-Only Section (Formats perfectly for A4 PDF) */}
                <div className="print-section bg-white p-8 md:p-12 rounded-2xl border hairline">
                    <div className="border-b-2 border-brown pb-6 mb-8 flex justify-between items-end">
                        <div>
                            <h2 className="font-display text-3xl text-brown italic">VEQ Knowledge Transfer Report</h2>
                            <p className="text-muted font-mono text-sm mt-2">Employee: {formData.employeeName || user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</p>
                            <p className="text-muted font-mono text-sm">Date: {new Date().toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <span className="px-4 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-mono font-bold tracking-wider">COMPLETED</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {steps.slice(0, 5).map((step, idx) => {
                            const displayValue = step.fields.map(f => formData[f as keyof typeof formData]).filter(Boolean).join('\n\n---\n\n') || "Not provided"
                            return (
                                <div key={idx} className="border-b hairline pb-6 last:border-0">
                                    <h3 className="font-display text-lg text-brown italic mb-3 flex items-center gap-3">
                                        <span className="w-7 h-7 rounded-full bg-brown text-cream-deep flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                        {step.title}
                                    </h3>
                                    <p className="text-xs font-mono text-muted mb-3 uppercase tracking-wide">{step.question}</p>
                                    <div className="bg-cream-deep/40 p-5 rounded-xl text-brown text-sm leading-relaxed whitespace-pre-wrap border hairline">
                                        {displayValue}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="mt-12 pt-8 border-t hairline text-center">
                        <p className="text-xs text-muted font-mono">Generated by VEQ AI Knowledge Management System</p>
                    </div>
                </div>
            </section>
        )
    }

    // ✅ FORM STATE: Multi-step Wizard with Voice Option
    return (
        <section className="max-w-4xl mx-auto px-6 py-16 md:py-24 relative">
            <button
                onClick={handleExit}
                className="absolute top-0 right-0 p-2 rounded-full hover:bg-cream-deep/60 transition-colors text-muted hover:text-brown"
                title="Exit without saving"
            >
                <X className="w-6 h-6" />
            </button>

            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                Continuity · Knowledge Capture
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                Exit Brain Dump
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Your knowledge is the company's biggest asset. Let's transfer it safely. You can type or **record your voice**.
            </p>

            {/* Progress bar */}
            <div className="mb-12">
                <div className="flex justify-between mb-2">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold transition-all ${idx <= currentStep ? "bg-brown text-cream-deep" : "bg-cream-deep text-muted"}`}
                        >
                            {idx < currentStep ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                        </div>
                    ))}
                </div>
                <div className="w-full bg-cream-deep rounded-full h-2">
                    <div
                        className="bg-gold h-2 rounded-full transition-all duration-500"
                        style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="rounded-2xl border hairline bg-cream-deep/40 p-8 md:p-12 shadow-sm">
                {!currentStepData.isVoiceStep ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="p-3 bg-brown/10 rounded-xl text-brown">
                                {currentStepData.icon}
                            </div>
                            <h2 className="font-display text-2xl text-brown italic">
                                {currentStepData.title}
                            </h2>
                        </div>

                        <label className="block text-sm font-mono text-muted mb-3">
                            {currentStepData.question}
                        </label>

                        <div className="space-y-4">
                            {currentStepData.fields.map((field) => (
                                <div key={field}>
                                    {field === "employeeName" && (
                                        <input
                                            type="text"
                                            value={formData[field as keyof typeof formData]}
                                            onChange={(e) => {
                                                setErrorMsg("")
                                                setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                                            }}
                                            placeholder="e.g., Rohan Sharma"
                                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-gold text-brown text-sm mb-3"
                                        />
                                    )}

                                    {(field === "responsibilities" || field === "processes" || field === "decisions" || field === "unresolved" || field === "dependencies") && (
                                        <textarea
                                            value={formData[field as keyof typeof formData]}
                                            onChange={(e) => {
                                                setErrorMsg("")
                                                setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                                            }}
                                            placeholder={currentStepData.placeholder}
                                            rows={field === "unresolved" || field === "dependencies" ? 4 : 5}
                                            className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-gold text-brown resize-none text-sm leading-relaxed mb-3"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    /* 🔥 VOICE STEP UI */
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <div className="p-3 bg-brown/10 rounded-xl text-brown">
                                {currentStepData.icon}
                            </div>
                            <h2 className="font-display text-2xl text-brown italic">
                                {currentStepData.title}
                            </h2>
                        </div>
                        <p className="text-muted mb-8 max-w-md mx-auto">
                            Record a voice note covering your responsibilities, processes, and decisions. We'll transcribe it automatically. Or, just submit what you've typed.
                        </p>

                        <div className="bg-white/60 rounded-2xl p-8 border hairline mb-6 max-w-md mx-auto">
                            {isRecording ? (
                                <div>
                                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <StopCircle className="w-12 h-12 text-red-600" />
                                    </div>
                                    <p className="font-display text-3xl text-brown mb-2 font-mono">
                                        {formatTime(recordingTime)}
                                    </p>
                                    <p className="text-muted text-sm mb-6">Recording... Speak clearly about your work</p>
                                    <button
                                        onClick={stopRecording}
                                        className="px-8 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-mono text-sm font-semibold"
                                    >
                                        Stop Recording
                                    </button>
                                </div>
                            ) : audioBlob ? (
                                <div>
                                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                                    </div>
                                    <p className="font-display text-xl text-brown mb-2">Recording Complete!</p>
                                    <p className="text-muted text-sm mb-6">Duration: {formatTime(recordingTime)}</p>
                                    <div className="flex gap-4 justify-center">
                                        <button
                                            onClick={() => { setAudioBlob(null); setRecordingTime(0); }}
                                            className="px-6 py-3 border border-brown text-brown rounded-xl hover:bg-brown hover:text-cream-deep transition-colors font-mono text-sm font-semibold"
                                        >
                                            Re-record
                                        </button>
                                        <button
                                            onClick={uploadRecording}
                                            disabled={isGenerating}
                                            className="px-8 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50"
                                        >
                                            {isGenerating ? (
                                                <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                            ) : (
                                                <><Upload className="w-4 h-4" /> Upload & Process</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div className="w-24 h-24 bg-cream-deep rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mic className="w-12 h-12 text-brown" />
                                    </div>
                                    <p className="font-display text-xl text-brown mb-6">Ready to Record</p>
                                    <button
                                        onClick={startRecording}
                                        className="px-8 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold mb-4 w-full"
                                    >
                                        <Mic className="w-4 h-4" /> Start Recording
                                    </button>
                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-brown/20"></div>
                                        <span className="flex-shrink-0 mx-4 text-muted text-xs font-mono">OR</span>
                                        <div className="flex-grow border-t border-brown/20"></div>
                                    </div>
                                    <button
                                        onClick={handleGenerateReport}
                                        disabled={isGenerating}
                                        className="w-full px-8 py-3 border border-brown text-brown rounded-xl hover:bg-brown hover:text-cream-deep transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 mt-4"
                                    >
                                        {isGenerating ? (
                                            <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                        ) : (
                                            <><Save className="w-4 h-4" /> Skip & Submit Text Only</>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {errorMsg && <p className="text-red-600 text-sm mt-3 font-mono flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {errorMsg}</p>}

                {/* Navigation buttons (only show for steps 0-4) */}
                {!currentStepData.isVoiceStep && (
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className="px-6 py-3 border hairline text-muted rounded-xl hover:bg-cream-deep/60 transition-colors flex items-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                        </button>

                        <button
                            onClick={handleNext}
                            className="px-6 py-3 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
                        >
                            {currentStep === steps.length - 2 ? "Go to Voice Option" : "Next Step"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </section>
    )
}