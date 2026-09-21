// components/KmsNavbar.tsx (Client Component — just the interactive nav)
"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function KmsNavbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#3A2418]/10 bg-[#F4EDE1]/95 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                    <span className="font-display text-xl tracking-tight text-[#3A2418] font-bold italic">VEQ</span>
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="/knowledge-management-system" className="text-sm font-mono font-medium text-[#C6A15B]">Product</Link>
                    <Link href="/offboarding-checklist-template" className="text-sm font-mono font-medium text-[#806B58] hover:text-[#3A2418]">Resources</Link>
                    <Link href="/dashboard" className="px-5 py-2.5 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] text-sm font-mono font-semibold transition-colors">
                        Get Started
                    </Link>
                </div>

                <button className="md:hidden text-[#3A2418]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#F4EDE1] border-b border-[#3A2418]/10 p-6 flex flex-col gap-4 shadow-lg">
                    <Link href="/knowledge-management-system" className="text-base font-mono font-medium text-[#C6A15B]" onClick={() => setIsMenuOpen(false)}>Product</Link>
                    <Link href="/offboarding-checklist-template" className="text-base font-mono font-medium text-[#3A2418]" onClick={() => setIsMenuOpen(false)}>Resources</Link>
                    <Link href="/dashboard" className="text-center px-5 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-lg font-mono font-semibold" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                </div>
            )}
        </nav>
    )
}