"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Building2, User, ArrowRight, Loader2, Mail, Plus, X, CheckCircle } from "lucide-react"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OnboardingPage() {
    const { user } = useUser()
    const router = useRouter()

    // State for multi-step flow
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    // Step 1 Data
    const [formData, setFormData] = useState({
        companyName: "",
        role: "Founder",
        companySize: "1-10"
    })

    // Step 2 Data (Team Invites)
    const [inviteEmails, setInviteEmails] = useState<string[]>([])
    const [currentEmail, setCurrentEmail] = useState("")

    // --- STEP 1 LOGIC ---
    const handleNextStep = () => {
        if (!formData.companyName.trim()) {
            setErrorMessage("Please enter your company name.")
            return
        }
        setErrorMessage(null)
        setStep(2) // Move to the email invitation step
    }

    const handleAddEmail = (e: React.FormEvent) => {
        e.preventDefault()
        if (currentEmail.trim() && !inviteEmails.includes(currentEmail.trim())) {
            setInviteEmails([...inviteEmails, currentEmail.trim()])
            setCurrentEmail("")
        }
    }

    const removeEmail = (emailToRemove: string) => {
        setInviteEmails(inviteEmails.filter(email => email !== emailToRemove))
    }

    // --- FINAL LAUNCH LOGIC ---
    const handleFinalLaunch = async () => {
        if (!user?.id) {
            setErrorMessage("User not authenticated. Please refresh and try again.")
            return
        }

        setLoading(true)
        setErrorMessage(null)

        try {
            // 1. Create Company
            const { data: companyData, error: companyError } = await supabase
                .from("companies")
                .insert({
                    name: formData.companyName,
                    size: formData.companySize
                })
                .select("id")
                .single()

            if (companyError) throw new Error(`Company creation failed: ${companyError.message}`)
            const newCompanyId = companyData.id

            // 2. Upsert User Profile (Founder)
            const { error: profileError } = await supabase
                .from("user_profiles")
                .upsert({
                    id: user.id,
                    email: user.emailAddresses?.[0]?.emailAddress || "",
                    company_id: newCompanyId,
                    role: formData.role,
                    has_completed_onboarding: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

            if (profileError) throw new Error(`Profile save failed: ${profileError.message}`)

            // 3. (Optional) Save invited emails to a table or send invites later
            // For now, we just finish the flow.

            console.log("✅ Setup Complete! Redirecting...")
            router.push("/dashboard")

        } catch (err: any) {
            console.error("💥 Error:", err)
            setErrorMessage(err.message || "Something went wrong.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] flex items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-[#E9DED0] overflow-hidden">

                {/* Header */}
                <div className="bg-[#3A2418] p-8 text-center">
                    <div className="w-16 h-16 bg-[#C6A15B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-3xl font-display text-white italic font-bold">V</span>
                    </div>
                    <h1 className="font-display text-3xl text-[#F4EDE1] italic mb-2">Welcome to VEQ!</h1>
                    <p className="text-[#E9DED0] font-mono text-sm">
                        {step === 1 ? "Set up your workspace in 30 seconds." : "Invite your team to collaborate."}
                    </p>

                    {/* Progress Dots */}
                    <div className="flex justify-center gap-2 mt-6">
                        <div className={`h-1.5 w-8 rounded-full ${step === 1 ? 'bg-[#C6A15B]' : 'bg-[#C6A15B]/30'}`}></div>
                        <div className={`h-1.5 w-8 rounded-full ${step === 2 ? 'bg-[#C6A15B]' : 'bg-[#C6A15B]/30'}`}></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-12 space-y-8">

                    {errorMessage && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                            {errorMessage}
                        </div>
                    )}

                    {/* ================= STEP 1: COMPANY INFO ================= */}
                    {step === 1 && (
                        <>
                            <div>
                                <label className="block text-sm font-mono text-[#806B58] mb-2 uppercase tracking-wider">
                                    What is your Company Name?
                                </label>
                                <div className="relative">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#806B58]" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                                        placeholder="e.g., Acme Corp"
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-mono text-[#806B58] mb-3 uppercase tracking-wider">
                                    What is your role?
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {["Founder", "HR Manager", "Team Lead"].map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, role }))}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === role
                                                ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#3A2418]"
                                                : "border-[#E9DED0] bg-white text-[#806B58] hover:border-[#C6A15B]/50"
                                                }`}
                                        >
                                            <User className="w-6 h-6" />
                                            <span className="font-mono text-sm font-semibold">{role}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-mono text-[#806B58] mb-3 uppercase tracking-wider">
                                    Team Size
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["1-10", "11-50", "50+"].map((size) => (
                                        <button
                                            key={size}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, companySize: size }))}
                                            className={`py-3 rounded-xl border-2 transition-all font-mono text-sm font-semibold ${formData.companySize === size
                                                ? "border-[#C6A15B] bg-[#C6A15B]/10 text-[#3A2418]"
                                                : "border-[#E9DED0] bg-white text-[#806B58] hover:border-[#C6A15B]/50"
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleNextStep}
                                className="w-full py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-lg"
                            >
                                Next: Invite Team <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {/* ================= STEP 2: INVITE TEAM ================= */}
                    {step === 2 && (
                        <>
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-display text-[#3A2418] italic">Add Your Team Members</h2>
                                <p className="text-[#806B58] font-mono text-sm mt-2">
                                    Enter the email addresses of employees who will join your workspace.
                                </p>
                            </div>

                            <form onSubmit={handleAddEmail} className="flex gap-3">
                                <div className="relative flex-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#806B58]" />
                                    <input
                                        type="email"
                                        value={currentEmail}
                                        onChange={(e) => setCurrentEmail(e.target.value)}
                                        placeholder="colleague@company.com"
                                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#C6A15B] text-white px-4 rounded-xl hover:bg-[#b08d4b] transition"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </form>

                            {/* List of Added Emails */}
                            {inviteEmails.length > 0 && (
                                <div className="space-y-2 mt-4 max-h-48 overflow-y-auto">
                                    {inviteEmails.map((email) => (
                                        <div key={email} className="flex items-center justify-between bg-[#F4EDE1] p-3 rounded-lg border border-[#E9DED0]">
                                            <span className="text-[#3A2418] font-mono text-sm flex items-center gap-2">
                                                <CheckCircle className="w-4 h-4 text-green-600" /> {email}
                                            </span>
                                            <button onClick={() => removeEmail(email)} className="text-red-500 hover:text-red-700">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-4 border-2 border-[#E9DED0] text-[#806B58] rounded-xl hover:bg-[#F4EDE1] transition font-mono text-sm font-semibold"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleFinalLaunch}
                                    disabled={loading}
                                    className="flex-[2] py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-lg disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" /> Setting up...
                                        </>
                                    ) : (
                                        <>
                                            Launch My Workspace <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}