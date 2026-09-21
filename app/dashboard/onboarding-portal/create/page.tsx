"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useUser } from "@clerk/nextjs"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CreateOnboardingTaskPage() {
    const router = useRouter()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        newHireEmail: "",
        dayPhase: "Day 1",
        taskTitle: "",
        taskDescription: ""
    })

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        setLoading(true)
        try {
            // Use clerk_id (TEXT) instead of id (UUID)
            const { data: profile, error: profileError } = await supabase
                .from("user_profiles")
                .select("company_id, clerk_id")
                .eq("clerk_id", user.id)  // Use clerk_id column
                .single()

            if (profileError || !profile?.company_id) {
                console.error("Profile error:", profileError)
                alert("Company profile not found. Please complete onboarding first.")
                setLoading(false)
                return
            }

            // Find new hire by email
            let assignedToId = null
            if (formData.newHireEmail) {
                const { data: existingUser } = await supabase
                    .from("user_profiles")
                    .select("id")
                    .eq("email", formData.newHireEmail)
                    .single()

                assignedToId = existingUser?.id || null
            }

            // Create the onboarding task
            const { error: insertError } = await supabase
                .from("onboarding_tasks")
                .insert({
                    company_id: profile.company_id,
                    assigned_to: assignedToId,
                    title: formData.taskTitle,
                    description: formData.taskDescription || null,
                    day_phase: formData.dayPhase,
                    is_completed: false
                })

            if (insertError) {
                console.error("Insert error:", insertError)
                throw insertError
            }

            setSuccess(true)
            setTimeout(() => {
                router.push("/dashboard/onboarding-portal")
            }, 2000)

        } catch (err: any) {
            console.error("Error creating task:", err)
            alert(err.message || "Failed to create task. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <section className="max-w-2xl mx-auto px-6 py-24 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h1 className="font-display text-3xl text-[#3A2418] italic mb-4">Task Created Successfully!</h1>
                <p className="text-[#806B58] mb-6">Redirecting to Onboarding Portal...</p>
                <Link
                    href="/dashboard/onboarding-portal"
                    className="inline-flex px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-colors font-mono text-sm font-semibold"
                >
                    Go to Portal
                </Link>
            </section>
        )
    }

    return (
        <section className="max-w-2xl mx-auto px-6 py-16">
            <Link
                href="/dashboard/onboarding-portal"
                className="inline-flex items-center gap-2 text-sm text-[#806B58] hover:text-[#3A2418] mb-8 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Onboarding Portal
            </Link>

            <div className="mb-8">
                <h1 className="font-display text-4xl text-[#3A2418] italic mb-2">Assign to New Hire</h1>
                <p className="text-[#806B58]">Create a new onboarding task for your new employee.</p>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-6 bg-white p-8 rounded-2xl border border-[#E9DED0] shadow-sm">
                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        New Hire Email <span className="text-[#C6A15B]">(Optional)</span>
                    </label>
                    <input
                        type="email"
                        value={formData.newHireEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, newHireEmail: e.target.value }))}
                        placeholder="newhire@company.com"
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418]"
                    />
                    <p className="text-xs text-[#806B58] mt-2">
                        Leave blank to create a general template task.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        Onboarding Phase
                    </label>
                    <select
                        value={formData.dayPhase}
                        onChange={(e) => setFormData(prev => ({ ...prev, dayPhase: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418]"
                    >
                        <option value="Day 1">Day 1 - Welcome & Setup</option>
                        <option value="Day 7">Day 7 - Training & Knowledge Base</option>
                        <option value="Day 30">Day 30 - Integration & First Project</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.taskTitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, taskTitle: e.target.value }))}
                        placeholder="e.g., Complete HR paperwork"
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-mono text-[#806B58] mb-2">
                        Description <span className="text-[#C6A15B]">(Optional)</span>
                    </label>
                    <textarea
                        rows={3}
                        value={formData.taskDescription}
                        onChange={(e) => setFormData(prev => ({ ...prev, taskDescription: e.target.value }))}
                        placeholder="e.g., Fill out tax forms, insurance enrollment, and emergency contact details"
                        className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] resize-none"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating Task...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-5 h-5" />
                            Create Onboarding Task
                        </>
                    )}
                </button>
            </form>
        </section>
    )
}