import { Suspense } from 'react'

export default function JoinLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#F9F9F7]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C6A15B]" />
                        <p className="text-gray-500 text-sm">Loading your invite...</p>
                    </div>
                </div>
            }
        >
            {children}
        </Suspense>
    )
}