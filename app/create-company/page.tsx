// app/create-company/page.tsx
"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function CreateCompanyPage() {
    const router = useRouter()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        companyName: '',
        companyEmail: '',
        location: '',
        industry: '',
        employeeEmails: [] as string[],
    })

    const [newEmail, setNewEmail] = useState('')

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const handleAddEmail = () => {
        if (newEmail && !formData.employeeEmails.includes(newEmail)) {
            setFormData({
                ...formData,
                employeeEmails: [...formData.employeeEmails, newEmail]
            })
            setNewEmail('')
        }
    }

    const handleRemoveEmail = (email: string) => {
        setFormData({
            ...formData,
            employeeEmails: formData.employeeEmails.filter(e => e !== email)
        })
    }

    const handleSubmit = async () => {
        if (!user) {
            setError('Please login first')
            return
        }

        // Check if env variables are loaded
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setError('Supabase environment variables not configured')
            return
        }

        setLoading(true)
        setError('')

        try {
            console.log('Starting company creation...')
            console.log('User:', user.id)
            console.log('Form data:', formData)

            // 1. Unique Company ID generate karo
            const companyId = `VEQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
            console.log('Generated Company ID:', companyId)

            // 2. Company database mein save karo
            const { data: company, error: companyError } = await supabase
                .from('companies')
                .insert({
                    company_id: companyId,
                    company_name: formData.companyName,
                    company_email: formData.companyEmail,
                    location: formData.location,
                    industry: formData.industry,
                    founder_id: user.id,
                    founder_email: user.primaryEmailAddress?.emailAddress,
                })
                .select()
                .single()

            if (companyError) {
                console.error('Company Error Details:', companyError)
                throw new Error(`Company creation failed: ${companyError.message}`)
            }

            console.log('Company created:', company)

            // 3. Founder ko user_profiles mein add karo
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    role: 'founder',
                    company_id: company.id,
                    updated_at: new Date().toISOString(),
                })

            if (profileError) {
                console.error('Profile Error:', profileError)
                throw new Error(`Profile update failed: ${profileError.message}`)
            }

            console.log('Profile updated')

            // 4. Employees ko invites create karo
            for (const email of formData.employeeEmails) {
                const inviteToken = Math.random().toString(36).substring(2, 15)

                const { error: inviteError } = await supabase
                    .from('employee_invites')
                    .insert({
                        company_id: company.id,
                        employee_email: email,
                        invite_token: inviteToken,
                        status: 'pending',
                    })

                if (inviteError) {
                    console.error('Invite Error:', inviteError)
                } else {
                    console.log(`Invite created for ${email}`)
                }
            }

            // 5. Success!
            alert(` Company Created Successfully!\n\nCompany ID: ${companyId}\nCompany Name: ${formData.companyName}\n\nEmployees invited: ${formData.employeeEmails.length}`)
            router.push('/dashboard')

        } catch (error: any) {
            console.error('Full Error:', error)
            setError(error.message || 'Unknown error occurred')
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] p-8">
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <div className="mb-8">
                    <h1 className="font-display text-4xl text-[#3E2723] italic mb-2">
                        Create Your Company
                    </h1>
                    <p className="text-[#795548]">
                        Set up your workspace and invite your team
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 font-medium">Error: {error}</p>
                    </div>
                )}

                <div className="space-y-6 mb-8">
                    <h2 className="text-xl font-bold text-[#3E2723] mb-4 border-b pb-2">Company Details</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="e.g., Acme Inc."
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Company Email *</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="contact@yourcompany.com"
                            value={formData.companyEmail}
                            onChange={e => setFormData({ ...formData, companyEmail: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                        <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="e.g., Mumbai, India"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            value={formData.industry}
                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                        >
                            <option value="">Select Industry</option>
                            <option value="Technology">Technology</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Finance">Finance</option>
                            <option value="Healthcare">Healthcare</option>
                            <option value="Education">Education</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-6 mb-8">
                    <h2 className="text-xl font-bold text-[#3E2723] mb-4 border-b pb-2">Invite Your Team</h2>

                    <div className="flex gap-2">
                        <input
                            type="email"
                            className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="employee@company.com"
                            value={newEmail}
                            onChange={e => setNewEmail(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleAddEmail()}
                        />
                        <button
                            type="button"
                            onClick={handleAddEmail}
                            className="px-6 py-3 bg-[#C6A15B] text-white font-bold rounded-lg hover:bg-[#b08d4b]"
                        >
                            Add
                        </button>
                    </div>

                    {formData.employeeEmails.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                                {formData.employeeEmails.length} employee(s) added:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {formData.employeeEmails.map((email, idx) => (
                                    <div
                                        key={idx}
                                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg"
                                    >
                                        <span className="text-sm text-gray-700">{email}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(email)}
                                            className="text-red-500 hover:text-red-700 font-bold"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.companyName || !formData.companyEmail}
                    className="w-full bg-[#C6A15B] text-white font-bold py-4 rounded-lg hover:bg-[#b08d4b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Creating Company...' : ' Create Company & Send Invites'}
                </button>
            </div>
        </div>
    )
}