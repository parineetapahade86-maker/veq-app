"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { Building2, User, ArrowRight, Loader2 } from "lucide-react"

// ✅ SAFE & SECURE: Client-side ke liye hamesha ANON KEY use karte hain!
// (Service Role Key kabhi bhi "use client" file mein mat dalna, ye security risk hai)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function OnboardingPage() {
    const { user } = useUser()
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        companyName: "",
        role: "Founder",
        companySize: "1-10"
    })

    const handleCompleteSetup = async () => {
        if (!formData.companyName.trim()) {
            alert("Please enter your company name")
            return
        }

        if (!user?.id) {
            alert("User not authenticated")
            return
        }

        setLoading(true)
        try {
            console.log("📤 Setting up workspace...", formData)

            // 1. SABSE PEHLE: Company create karo aur uska ID lo
            const { data: companyData, error: companyError } = await supabase
                .from("companies")
                .insert({
                    name: formData.companyName,
                    size: formData.companySize
                })
                .select("id")
                .single()

            if (companyError) {
                console.error("❌ Company creation error:", companyError)
                throw new Error("Failed to create company. Please check database permissions.")
            }

            const newCompanyId = companyData.id

            // 2. Check karo ki profile pehle se hai ya nahi
            const { data: existingProfile } = await supabase
                .from("user_profiles")
                .select("id")
                .eq("id", user.id)
                .single()

            let error

            if (existingProfile) {
                // UPDATE existing profile with the NEW company_id
                const { error: updateError } = await supabase
                    .from("user_profiles")
                    .update({
                        company_id: newCompanyId, // ✅ YE HAI WO MAGIC LINK!
                        role: formData.role,
                        has_completed_onboarding: true,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", user.id)
                error = updateError
            } else {
                // INSERT new profile with the NEW company_id
                const { error: insertError } = await supabase
                    .from("user_profiles")
                    .insert({
                        id: user.id,
                        email: user.emailAddresses?.[0]?.emailAddress,
                        company_id: newCompanyId, // ✅ YE HAI WO MAGIC LINK!
                        role: formData.role,
                        has_completed_onboarding: true,
                        created_at: new Date().toISOString()
                    })
                error = insertError
            }

            if (error) {
                console.error("❌ Profile update error:", error)
                throw new Error("Failed to save profile. Please try again.")
            }

            console.log("✅ Onboarding completed successfully! Company ID:", newCompanyId)

            // Refresh and redirect to dashboard
            router.refresh()
            setTimeout(() => {
                router.push("/dashboard")
            }, 100)

        } catch (err: any) {
            console.error("Onboarding error:", err)
            alert(err.message || "Something went wrong. Please try again.")
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
                    <p className="text-[#E9DED0] font-mono text-sm">Let's set up your organizational memory in 30 seconds.</p>
                </div>

                {/* Form Content */}
                <div className="p-8 md:p-12 space-y-8">

                    {/* Company Name */}
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
                                placeholder="e.g., Acme Corp, Stellar AI"
                                className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] font-display text-lg italic"
                            />
                        </div>
                    </div>

                    {/* Role Selection */}
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

                    {/* Company Size */}
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

                    {/* Submit Button */}
                    <button
                        onClick={handleCompleteSetup}
                        disabled={loading || !formData.companyName.trim()}
                        className="w-full py-4 bg-[#3A2418] text-[#F4EDE1] rounded-xl hover:bg-[#4A2F20] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Setting up your brain...
                            </>
                        ) : (
                            <>
                                Launch My Workspace
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>

                </div>
            </div>
        </main>
    )
}