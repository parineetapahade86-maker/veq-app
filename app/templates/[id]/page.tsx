"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Loader2, CheckCircle2, Download } from "lucide-react"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Template Data (Same as templates page)
const templatesData: Record<string, any> = {
    "1": {
        title: "New Employee Onboarding",
        category: "HR & People",
        description: "A complete 30-day checklist for new hires.",
        tasks: [
            { day_phase: "Day 1", title: "Complete HR paperwork and tax forms", description: "Fill out all necessary employment documents" },
            { day_phase: "Day 1", title: "Setup laptop and install required software", description: "Install VS Code, Slack, and other tools" },
            { day_phase: "Day 1", title: "Meet the team and join Slack channels", description: "Introduction meeting with all team members" },
            { day_phase: "Day 7", title: "Read the Employee Handbook", description: "Understand company policies and culture" },
            { day_phase: "Day 7", title: "Complete security training", description: "Mandatory cybersecurity awareness course" },
            { day_phase: "Day 30", title: "First project assignment", description: "Complete your first independent task" },
            { day_phase: "Day 30", title: "30-day feedback session", description: "Review progress with manager" },
        ]
    },
    "2": {
        title: "IT Department Knowledge Base",
        category: "IT & Engineering",
        description: "Standard operating procedures for IT teams.",
        tasks: [
            { day_phase: "Day 1", title: "Server access and credentials", description: "Get access to production servers" },
            { day_phase: "Day 1", title: "Review security protocols", description: "Understand authentication and authorization" },
            { day_phase: "Day 7", title: "Password reset procedure", description: "Learn how to reset user passwords" },
            { day_phase: "Day 7", title: "Backup verification process", description: "Check daily backup logs" },
            { day_phase: "Day 30", title: "Incident response training", description: "Handle critical system failures" },
        ]
    },
    // Add more templates as needed
}

export default function TemplateDetailPage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUser()
    const [importing, setImporting] = useState(false)
    const [imported, setImported] = useState(false)

    const template = templatesData[params.id as string]

    if (!template) {
        return (
            <div className="min-h-screen bg-[#F4EDE1] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="font-display text-3xl text-[#3A2418] italic mb-4">Template Not Found</h1>
                    <Link href="/templates" className="text-[#C6A15B] hover:underline">← Back to Templates</Link>
                </div>
            </div>
        )
    }

    const handleImportTemplate = async () => {
        if (!user) {
            router.push("/sign-in")
            return
        }

        setImporting(true)
        try {
            // Get user's company_id
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("company_id")
                .eq("clerk_id", user.id)
                .single()

            if (!profile?.company_id) {
                alert("Company profile not found. Please complete onboarding first.")
                return
            }

            // Create all tasks from template
            const tasksToInsert = template.tasks.map((task: any) => ({
                company_id: profile.company_id,
                assigned_to: null,
                title: task.title,
                description: task.description || null,
                day_phase: task.day_phase,
                is_completed: false
            }))

            const { error } = await supabase
                .from("onboarding_tasks")
                .insert(tasksToInsert)

            if (error) throw error

            setImported(true)
            setTimeout(() => {
                router.push("/dashboard/onboarding-portal")
            }, 2000)

        } catch (err: any) {
            console.error("Import error:", err)
            alert(err.message || "Failed to import template")
        } finally {
            setImporting(false)
        }
    }

    if (imported) {
        return (
            <section className="min-h-screen bg-[#F4EDE1] flex items-center justify-center px-6">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="font-display text-3xl text-[#3A2418] italic mb-4">Template Imported Successfully!</h1>
                    <p className="text-[#806B58] mb-6">Redirecting to your Onboarding Portal...</p>
                    <Link
                        href="/dashboard/onboarding-portal"
                        className="inline-flex px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold"
                    >
                        Go to Portal
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418]">
            <div className="max-w-4xl mx-auto px-6 py-16">
                {/* Back Button */}
                <Link
                    href="/templates"
                    className="inline-flex items-center gap-2 text-sm text-[#806B58] hover:text-[#3A2418] mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Templates
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <span className="inline-block px-3 py-1 bg-[#C6A15B]/10 text-[#C6A15B] rounded-full text-xs font-mono mb-4">
                        {template.category}
                    </span>
                    <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
                        {template.title}
                    </h1>
                    <p className="text-lg text-[#806B58]">{template.description}</p>
                </div>

                {/* Tasks Preview */}
                <div className="bg-white rounded-2xl border border-[#E9DED0] p-8 mb-8">
                    <h2 className="font-display text-2xl text-[#3A2418] italic mb-6">
                        What's Included ({template.tasks.length} tasks)
                    </h2>

                    <div className="space-y-4">
                        {template.tasks.map((task: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-[#F4EDE1]/50 border border-[#E9DED0]">
                                <div className="w-6 h-6 rounded-full bg-[#C6A15B]/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-[#C6A15B]">{idx + 1}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono text-[#806B58] bg-[#E9DED0] px-2 py-0.5 rounded">
                                            {task.day_phase}
                                        </span>
                                    </div>
                                    <h3 className="font-medium text-[#3A2418] mb-1">{task.title}</h3>
                                    {task.description && (
                                        <p className="text-sm text-[#806B58]">{task.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Import Button */}
                <div className="text-center">
                    <button
                        onClick={handleImportTemplate}
                        disabled={importing}
                        className="inline-flex px-8 py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all items-center gap-2 font-mono text-sm font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {importing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Importing Template...
                            </>
                        ) : (
                            <>
                                <Download className="w-5 h-5" />
                                Import This Template
                            </>
                        )}
                    </button>
                    <p className="text-xs text-[#806B58] mt-4">
                        This will add {template.tasks.length} tasks to your Onboarding Portal
                    </p>
                </div>
            </div>
        </main>
    )
}