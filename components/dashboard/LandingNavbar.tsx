"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export default function LandingNavbar() {
    const pathname = usePathname()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const navLinks = [
        { name: "Product", href: "/knowledge-management-system" },
        { name: "Offboarding", href: "/knowledge-transfer-software" },
        { name: "Resources", href: "/offboarding-checklist-template" },
        { name: "Blog", href: "/blog/knowledge-transfer-plan" },
    ]

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[#3A2418]/10 bg-[#F4EDE1]/90 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B] group-hover:scale-110 transition-transform" />
                    <span className="font-display text-xl tracking-tight text-[#3A2418] font-bold">VEQ</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-sm font-mono font-medium transition-colors ${pathname === link.href
                                    ? "text-[#C6A15B]"
                                    : "text-[#806B58] hover:text-[#3A2418]"
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* CTA Buttons */}
                <div className="hidden md:flex items-center gap-4">
                    <Link
                        href="/sign-in"
                        className="text-sm font-mono font-semibold text-[#3A2418] hover:text-[#C6A15B] transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] transition-all text-sm font-mono font-semibold shadow-sm"
                    >
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-[#3A2418]"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-[#F4EDE1] border-b border-[#3A2418]/10 p-6 flex flex-col gap-4 shadow-lg">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-base font-mono font-medium text-[#3A2418] py-2"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[#3A2418]/10">
                        <Link href="/sign-in" className="text-center text-sm font-mono font-semibold text-[#3A2418]">Log in</Link>
                        <Link href="/dashboard" className="text-center px-5 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-lg font-mono font-semibold">Get Started</Link>
                    </div>
                </div>
            )}
        </nav>
    )
}