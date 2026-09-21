"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { Users, LogOut, CheckCircle2, Loader2, AlertTriangle } from "lucide-react"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HROffboardingPage() {
    const { user } = useUser()
    const [employees, setEmployees] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    useEffect(() => {
        fetchEmployees()
    }, [])

    const fetchEmployees = async () => {
        setLoading(true)
        // Fetch all profiles (In real app, filter by company_id)
        const { data, error } = await supabase
            .from("user_profiles")
            .select("id, email, role, employment_status, offboarding_started_at")
            .order("created_at", { ascending: false })

        if (data) setEmployees(data)
        setLoading(false)
    }

    const handleInitiateOffboarding = async (employeeId: string) => {
        setActionLoading(employeeId)
        try {
            // Update status to 'offboarding'
            const { error } = await supabase
                .from("user_profiles")
                .update({
                    employment_status: 'offboarding',
                    offboarding_started_at: new Date().toISOString()
                })
                .eq("id", employeeId)

            if (error) throw error

            // Refresh list
            fetchEmployees()
            alert("✅ Offboarding initiated! (Next step: Send Exit Brain Dump Email)")
        } catch (err) {
            console.error(err)
            alert("Failed to initiate offboarding.")
        } finally {
            setActionLoading(null)
        }
    }

    const getStatusBadge = (status: string) => {
        if (status === 'active') return "bg-green-100 text-green-800 border-green-200"
        if (status === 'offboarding') return "bg-yellow-100 text-yellow-800 border-yellow-200"
        if (status === 'departed') return "bg-red-100 text-red-800 border-red-200"
        return "bg-gray-100 text-gray-800"
    }

    return (
        <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
                HR Operations · Offboarding
            </p>
            <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
                HR Offboarding Dashboard
            </h1>
            <p className="text-muted max-w-xl mb-12">
                Manage employee transitions. Initiate offboarding to trigger the VEQ Knowledge Capture process.
            </p>

            {/* EMPLOYEES LIST */}
            <div className="bg-white rounded-2xl border border-[#E9DED0] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#E9DED0] flex items-center gap-3 bg-[#F4EDE1]/50">
                    <Users className="w-5 h-5 text-[#3A2418]" />
                    <h2 className="font-display text-xl text-[#3A2418] italic">Team Members</h2>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="w-8 h-8 text-[#C6A15B] animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="divide-y divide-[#E9DED0]">
                        {employees.map((emp) => (
                            <div key={emp.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F4EDE1]/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#3A2418] text-[#F4EDE1] flex items-center justify-center font-mono font-bold">
                                        {emp.email?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-display text-lg text-[#3A2418] italic">{emp.email}</p>
                                        <p className="text-xs text-[#806B58] font-mono uppercase">{emp.role || 'Employee'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${getStatusBadge(emp.employment_status)}`}>
                                        {emp.employment_status?.toUpperCase() || 'ACTIVE'}
                                    </span>

                                    {emp.employment_status === 'active' && (
                                        <button
                                            onClick={() => handleInitiateOffboarding(emp.id)}
                                            disabled={actionLoading === emp.id}
                                            className="px-4 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] transition-colors flex items-center gap-2 font-mono text-xs font-semibold disabled:opacity-50"
                                        >
                                            {actionLoading === emp.id ? (
                                                <Loader2 className="w-3 h-3 animate-spin" />
                                            ) : (
                                                <LogOut className="w-3 h-3" />
                                            )}
                                            Initiate Offboarding
                                        </button>
                                    )}

                                    {emp.employment_status === 'offboarding' && (
                                        <span className="text-xs text-[#806B58] font-mono flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Awaiting Brain Dump
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}