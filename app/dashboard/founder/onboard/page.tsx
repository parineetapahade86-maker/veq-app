// app/dashboard/founder/onboard/page.tsx

"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

export default function FounderOnboardingPage() {
    const router = useRouter()
    const { user } = useUser()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

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
        if (!user) return
        setLoading(true)

        try {
            // 1. Generate a unique company ID
            const companyId = `VEQ - ${Math.random().toString(36).substring(2, 8).toUpperCase()} `

            // 2. Save the company in the database
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

            if (companyError) throw companyError

            // 3. Add the founder to the user_profiles table
            await supabase
                .from('user_profiles')
                .insert({
                    id: user.id,
                    email: user.primaryEmailAddress?.emailAddress,
                    role: 'founder',
                    company_id: company.id,
                })

            // 4. Send invitations to employees
            for (const email of formData.employeeEmails) {
                const inviteToken = Math.random().toString(36).substring(2, 15)
                const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'} /join/${inviteToken} `

                await supabase
                    .from('employee_invites')
                    .insert({
                        company_id: company.id,
                        employee_email: email,
                        invite_link: inviteLink,
                        invite_token: inviteToken,
                    })

                // TODO: Send the email using Resend or SendGrid
                console.log(`Invite sent to ${email}: ${inviteLink} `)
            }

            // 5. Redirect the founder to the dashboard
            alert(
                `🎉 Company Created Successfully!\n\nCompany ID: ${companyId} \n\nEmployees invited: ${formData.employeeEmails.length} `
            )

            router.push('/dashboard/founder')

        } catch (error) {
            console.error('Error:', error)
            alert('Error creating company')

        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F9F9F7] p-8">
            <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">

                <h1 className="font-display text-3xl text-[#3E2723] italic mb-2">
                    Set Up Your Company
                </h1>

                <p className="text-[#795548] mb-8">
                    Create your company workspace and invite your team
                </p>

                {/* Step 1: Company Details */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-xl font-bold text-[#3E2723] mb-4">
                        Company Details
                    </h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Name *
                        </label>

                        <input
                            type="text"
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="e.g., Acme Inc."
                            value={formData.companyName}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    companyName: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Company Email *
                        </label>

                        <input
                            type="email"
                            required
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="contact@yourcompany.com"
                            value={formData.companyEmail}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    companyEmail: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>

                        <input
                            type="text"
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            placeholder="e.g., Mumbai, India"
                            value={formData.location}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    location: e.target.value
                                })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Industry
                        </label>

                        <select
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:border-[#C6A15B] focus:outline-none"
                            value={formData.industry}
                            onChange={e =>
                                setFormData({
                                    ...formData,
                                    industry: e.target.value
                                })
                            }
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

                {/* Step 2: Add Employees */}
                <div className="space-y-6 mb-8">
                    <h2 className="text-xl font-bold text-[#3E2723] mb-4">
                        Invite Your Team
                    </h2>

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
                                        <span className="text-sm text-gray-700">
                                            {email}
                                        </span>

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

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={
                        loading ||
                        !formData.companyName ||
                        !formData.companyEmail
                    }
                    className="w-full bg-[#C6A15B] text-white font-bold py-4 rounded-lg hover:bg-[#b08d4b] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? 'Creating Company...'
                        : 'Create Company & Send Invites'}
                </button>

            </div>
        </div>
    )
}
