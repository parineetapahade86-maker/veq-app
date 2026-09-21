'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function CompanyCreationPage() {
    const router = useRouter()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        companyName: '',
        location: '',
        founderName: '',
        companyEmail: '',
        whatTheyDo: '',
        totalEmployees: ''
    })

    // Employee emails management
    const [newEmail, setNewEmail] = useState('')
    const [employeeEmails, setEmployeeEmails] = useState<string[]>([])

    // Supabase client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Add email to list
    const handleAddEmail = () => {
        if (newEmail && isValidEmail(newEmail) && !employeeEmails.includes(newEmail)) {
            setEmployeeEmails([...employeeEmails, newEmail])
            setNewEmail('') // Clear input
        } else if (!isValidEmail(newEmail)) {
            alert('Please enter a valid email address')
        } else if (employeeEmails.includes(newEmail)) {
            alert('This email is already added')
        }
    }

    // Remove email from list
    const handleRemoveEmail = (emailToRemove: string) => {
        setEmployeeEmails(employeeEmails.filter(email => email !== emailToRemove))
    }

    // Email validation
    const isValidEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddEmail()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 1. Check if user is logged in
        if (!user) {
            alert("Please log in first!")
            return
        }

        // 2. Check if Supabase keys are present
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            alert("Supabase configuration missing! Please check your .env.local file.")
            return
        }

        setLoading(true)

        try {
            // Unique Company ID generate karo
            const companyId = `VEQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

            // Step A: Company database mein save karo
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .insert({
                    company_name: formData.companyName,
                    location: formData.location,
                    founder_name: formData.founderName,
                    company_email: formData.companyEmail,
                    what_they_do: formData.whatTheyDo,
                    total_employees: parseInt(formData.totalEmployees) || employeeEmails.length,
                    company_id: companyId
                })
                .select()
                .single()

            if (companyError) {
                console.error("Company Error:", companyError)
                throw new Error(`Company creation failed: ${companyError.message}`)
            }

            // Step B: Founder ko user_profiles mein add karo
            const { error: profileError } = await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    role: 'founder',
                    company_id: company.id
                })

            if (profileError) {
                console.error("Profile Error:", profileError)
                // Hum yahan error throw nahi karenge, kyunki company already ban gayi hai
            }

            // Step C: Employee invites create karo
            for (const email of employeeEmails) {
                const inviteToken = Math.random().toString(36).substring(2, 15)
                const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${inviteToken}`

                const { error: inviteError } = await supabase
                    .from('employee_invites')
                    .insert({
                        company_id: company.id,
                        employee_email: email,
                        invite_link: inviteLink
                    })

                if (inviteError) {
                    console.error(`Invite error for ${email}:`, inviteError)
                }
            }

            // Success!
            alert(`🎉 Company Created Successfully!\n\nCompany ID: ${companyId}\n\nEmployees added: ${employeeEmails.length}`)
            router.push('/dashboard/founder')

        } catch (error: any) {
            console.error('Full Error Details:', error)
            // YEH LINE SABSE ZARURI HAI: Exact error dikhayega
            const errorMsg = error.message || JSON.stringify(error)
            alert(`❌ Error: ${errorMsg}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black-rich p-8">
            <div className="max-w-3xl mx-auto bg-black border border-white/10 rounded-2xl shadow-2xl p-8">
                <h1 className="font-display text-3xl text-cream italic mb-2">Create Your Company</h1>
                <p className="text-muted-deep text-sm mb-8 font-mono">Set up your workspace and invite your team</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Name */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">Company Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            placeholder="e.g., Acme Inc."
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">Location</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            placeholder="e.g., San Francisco, CA"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    {/* Founder Name */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">Founder Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            placeholder="Your full name"
                            value={formData.founderName}
                            onChange={e => setFormData({ ...formData, founderName: e.target.value })}
                        />
                    </div>

                    {/* Company Email */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">Company Email *</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            placeholder="contact@yourcompany.com"
                            value={formData.companyEmail}
                            onChange={e => setFormData({ ...formData, companyEmail: e.target.value })}
                        />
                    </div>

                    {/* What They Do */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">What does your company do?</label>
                        <textarea
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            rows={3}
                            placeholder="Briefly describe your business..."
                            value={formData.whatTheyDo}
                            onChange={e => setFormData({ ...formData, whatTheyDo: e.target.value })}
                        />
                    </div>

                    {/* Total Employees */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">Total Employees</label>
                        <input
                            type="number"
                            className="w-full p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                            placeholder="Number of employees"
                            value={formData.totalEmployees}
                            onChange={e => setFormData({ ...formData, totalEmployees: e.target.value })}
                        />
                    </div>

                    {/* Employee Emails - NEW UI */}
                    <div>
                        <label className="block text-cream/80 text-sm font-medium mb-2">
                            Add Employee Emails
                        </label>
                        <div className="flex gap-2 mb-4">
                            <input
                                type="email"
                                className="flex-1 p-3 bg-black-rich border border-white/10 rounded-lg text-cream focus:border-gold focus:outline-none transition"
                                placeholder="employee@company.com"
                                value={newEmail}
                                onChange={e => setNewEmail(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button
                                type="button"
                                onClick={handleAddEmail}
                                className="px-6 py-3 bg-gold hover:bg-gold-deep text-black-rich font-bold rounded-lg transition"
                            >
                                Add Employee
                            </button>
                        </div>

                        {/* Added Emails List */}
                        {employeeEmails.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-cream/60 text-sm font-mono">{employeeEmails.length} employee(s) added:</p>
                                <div className="flex flex-wrap gap-2">
                                    {employeeEmails.map((email, index) => (
                                        <div
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg"
                                        >
                                            <span className="text-cream text-sm">{email}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmail(email)}
                                                className="text-red-400 hover:text-red-300 text-sm font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <p className="text-muted-deep text-xs mt-2 font-mono">
                            Add employees to invite them to your company workspace
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gold hover:bg-gold-deep text-black-rich font-bold py-4 rounded-lg transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating Company...' : 'Create Company Account'}
                    </button>
                </form>
            </div>
        </div>
    )
}