import { getSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

// ============================================
// TYPES
// ============================================
interface Company {
    company_name: string
}

interface EmployeeInvite {
    id: string
    invite_token: string
    employee_email: string
    status: 'pending' | 'accepted' | 'expired'
    expires_at: string | null
    created_at: string
    companies: Company | Company[] | null
}

interface JoinPageProps {
    params: Promise<{ token: string }>
}

// ============================================
// METADATA
// ============================================
export const metadata: Metadata = {
    title: 'Join Workspace | V',
    description: 'Accept your workspace invitation and create your account.',
}

// ============================================
// HELPERS
// ============================================

/**
 * Validates UUID format before hitting the database.
 * Saves a DB call if token is malformed.
 */
function isValidUUID(token: string): boolean {
    const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(token)
}

/**
 * Checks if the invite has expired.
 */
function isInviteExpired(invite: EmployeeInvite): boolean {
    if (!invite.expires_at) return false
    return new Date(invite.expires_at) < new Date()
}

/**
 * Safely extracts company name from Supabase nested relation.
 * Supabase sometimes returns nested relations as arrays.
 */
function getCompanyName(invite: EmployeeInvite): string {
    const company = Array.isArray(invite.companies)
        ? invite.companies[0]
        : invite.companies
    return company?.company_name || 'the Team'
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================

export default async function JoinPage({ params }: JoinPageProps) {
    // Next.js 15+ requires awaiting params
    const { token } = await params

    // 1. Validate token format before DB call
    if (!isValidUUID(token)) {
        notFound()
    }

    // 2. Initialize Supabase
    const supabase = getSupabase()
    if (!supabase) {
        return (
            <ErrorScreen
                title="Service Unavailable"
                message="Unable to connect to the server. Please try again later."
            />
        )
    }

    // 3. Fetch invite with company details
    const { data: invite, error } = await supabase
        .from('employee_invites')
        .select('*, companies(company_name)')
        .eq('invite_token', token)
        .eq('status', 'pending')
        .single()

    // 4. Handle database errors
    if (error) {
        // PGRST116 = no rows returned (not found)
        if (error.code === 'PGRST116') {
            notFound()
        }

        // Log actual errors for monitoring (Sentry, LogRocket, etc.)
        console.error('[JoinPage] Database error fetching invite:', {
            code: error.code,
            message: error.message,
            token,
        })

        return (
            <ErrorScreen
                title="Something Went Wrong"
                message="We encountered an error while validating your invite. Please try again or contact support."
            />
        )
    }

    // 5. Handle no data found
    if (!invite) {
        notFound()
    }

    const typedInvite = invite as unknown as EmployeeInvite

    // 6. Check if invite has expired
    if (isInviteExpired(typedInvite)) {
        return (
            <ErrorScreen
                title="Invite Expired"
                message="This invitation has expired. Please ask your admin to send a new one."
            />
        )
    }

    const companyName = getCompanyName(typedInvite)

    // 7. Build safe redirect URL using URLSearchParams
    const signUpParams = new URLSearchParams({
        email_address: typedInvite.employee_email,
        redirect_url: `/api/complete-invite?token=${token}`,
    })

    // 8. Render welcome screen
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F9F9F7] p-4">
            <article className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-sm text-center">
                {/* Brand Logo */}
                <div
                    className="w-16 h-16 bg-[#C6A15B] rounded-full flex items-center justify-center mx-auto mb-6"
                    aria-hidden="true"
                >
                    <span className="text-3xl text-white font-bold">V</span>
                </div>

                <h1 className="font-display text-3xl text-[#3E2723] italic mb-2">
                    Welcome to {companyName}!
                </h1>

                <p className="text-gray-600 mb-8 leading-relaxed">
                    You have been invited to join{' '}
                    <strong className="text-[#3E2723]">
                        {typedInvite.employee_email}
                    </strong>
                    . Click below to create your account and access the dashboard.
                </p>

                {/* CTA Button */}
                <Link
                    href={`/sign-up?${signUpParams.toString()}`}
                    className="block w-full bg-[#C6A15B] text-white font-bold py-3 rounded-lg 
                     hover:bg-[#b08d4b] active:bg-[#9a7a3f] 
                     transition-colors duration-200 
                     focus:outline-none focus:ring-2 focus:ring-[#C6A15B] focus:ring-offset-2"
                >
                    Create Account & Join
                </Link>

                <p className="text-xs text-gray-400 mt-4">
                    By joining, you agree to the company&apos;s workspace policies.
                </p>
            </article>
        </main>
    )
}

// ============================================
// REUSABLE ERROR SCREEN COMPONENT
// ============================================

function ErrorScreen({
    title,
    message,
}: {
    title: string
    message: string
}) {
    return (
        <main className="min-h-screen flex items-center justify-center bg-[#F9F9F7] p-4">
            <article className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
                {/* Error Icon */}
                <div
                    className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
                    aria-hidden="true"
                >
                    <svg
                        className="w-6 h-6 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-red-600 mb-2">{title}</h1>
                <p className="text-gray-600">{message}</p>
            </article>
        </main>
    )
}