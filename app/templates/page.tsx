"use client"

import Link from "next/link"
import { useState } from "react"
import {
    FileText, Users, Shield, Headphones, TrendingUp,
    Search, ArrowRight, CheckCircle2, Menu, X, Download
} from "lucide-react"

export default function TemplatesLibraryPage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")

    // Template Catalog Data (IDs are strings for Next.js dynamic routing)
    const templates = [
        {
            id: "1", // String ID for routing
            title: "New Employee Onboarding",
            category: "HR & People",
            icon: <Users className="w-6 h-6" />,
            description: "A complete 30-day checklist for new hires. Includes Day 1 setup, IT access, team introductions, and role-specific training tasks.",
            tasksCount: 7, // Actual count matching the detail page
            color: "bg-blue-100 text-blue-600"
        },
        {
            id: "2",
            title: "IT Department Knowledge Base",
            category: "IT & Engineering",
            icon: <Shield className="w-6 h-6" />,
            description: "Standard operating procedures for IT teams. Covers password resets, server maintenance, security protocols, and troubleshooting guides.",
            tasksCount: 5,
            color: "bg-purple-100 text-purple-600"
        },
        {
            id: "3",
            title: "HR Policies & Guidelines",
            category: "HR & People",
            icon: <FileText className="w-6 h-6" />,
            description: "Comprehensive template for company policies. Includes leave policies, code of conduct, remote work guidelines, and compliance docs.",
            tasksCount: 8,
            color: "bg-green-100 text-green-600"
        },
        {
            id: "4",
            title: "Customer Support FAQ",
            category: "Customer Success",
            icon: <Headphones className="w-6 h-6" />,
            description: "Ready-to-use FAQ structure for customer support. Includes common queries, escalation matrix, and response time SLAs.",
            tasksCount: 15,
            color: "bg-orange-100 text-orange-600"
        },
        {
            id: "5",
            title: "Sales Playbook",
            category: "Sales & Marketing",
            icon: <TrendingUp className="w-6 h-6" />,
            description: "Complete sales onboarding and process guide. Includes pitch decks, objection handling, CRM usage, and quota tracking.",
            tasksCount: 10,
            color: "bg-red-100 text-red-600"
        }
    ]

    // Filter templates based on search
    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418] font-sans">

            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 w-full border-b border-[#3A2418]/10 bg-[#F4EDE1]/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-xl tracking-tight text-[#3A2418] font-bold italic">VEQ</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/knowledge-management-system" className="text-sm font-mono font-medium text-[#806B58] hover:text-[#3A2418]">Product</Link>
                        <Link href="/templates" className="text-sm font-mono font-medium text-[#C6A15B]">Templates</Link>
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
                        <Link href="/knowledge-management-system" className="text-base font-mono font-medium text-[#3A2418]" onClick={() => setIsMenuOpen(false)}>Product</Link>
                        <Link href="/templates" className="text-base font-mono font-medium text-[#C6A15B]" onClick={() => setIsMenuOpen(false)}>Templates</Link>
                        <Link href="/dashboard" className="text-center px-5 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-lg font-mono font-semibold" onClick={() => setIsMenuOpen(false)}>Get Started</Link>
                    </div>
                )}
            </nav>

            {/* HERO SECTION */}
            <section className="px-6 py-20 md:py-24 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C6A15B]/10 border border-[#C6A15B]/30 mb-6">
                    <FileText className="w-4 h-4 text-[#C6A15B]" />
                    <span className="text-xs font-mono font-semibold text-[#C6A15B] uppercase tracking-wider">
                        Free Knowledge Base Templates
                    </span>
                </div>

                <h1 className="font-display text-4xl md:text-6xl text-[#3A2418] italic mb-6 leading-tight">
                    Start with a <span className="text-[#C6A15B]">Proven Template</span>
                </h1>

                <p className="text-lg md:text-xl text-[#806B58] max-w-2xl mx-auto mb-10 leading-relaxed">
                    Don't start from scratch. Use our expertly crafted templates to build your knowledge base, onboarding flows, and SOPs in minutes.
                </p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#806B58]" />
                    <input
                        type="text"
                        placeholder="Search templates (e.g., HR, IT, Sales)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] shadow-sm"
                    />
                </div>
            </section>

            {/* TEMPLATES GRID */}
            <section className="px-6 pb-24 max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTemplates.map((template) => (
                        <div
                            key={template.id}
                            className="group p-8 rounded-2xl border border-[#E9DED0] bg-white shadow-sm hover:border-[#C6A15B]/50 hover:shadow-md transition-all flex flex-col"
                        >
                            {/* Icon & Category */}
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${template.color}`}>
                                    {template.icon}
                                </div>
                                <span className="text-xs font-mono text-[#806B58] bg-[#F4EDE1] px-3 py-1 rounded-full">
                                    {template.category}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="font-display text-2xl text-[#3A2418] italic mb-3 group-hover:text-[#C6A15B] transition-colors">
                                {template.title}
                            </h3>
                            <p className="text-sm text-[#806B58] leading-relaxed mb-6 flex-grow">
                                {template.description}
                            </p>

                            {/* Footer Stats & Button (REAL LINK TO DETAIL PAGE) */}
                            <div className="flex items-center justify-between pt-6 border-t border-[#E9DED0]">
                                <div className="flex items-center gap-2 text-xs font-mono text-[#806B58]">
                                    <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" />
                                    {template.tasksCount} Pre-built items
                                </div>

                                {/* ✅ YE CHANGE SABSE ZARURI HAI: Real detail page par bhejta hai */}
                                <Link
                                    href={`/templates/${template.id}`}
                                    className="inline-flex items-center gap-1 text-sm font-mono font-semibold text-[#C6A15B] hover:text-[#3A2418] transition-colors"
                                >
                                    Use Template <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-xl text-[#806B58] font-display italic">No templates found matching your search.</p>
                    </div>
                )}
            </section>

            {/* CTA SECTION */}
            <section className="px-6 py-24 bg-[#3A2418] text-[#F4EDE1] text-center">
                <div className="max-w-3xl mx-auto">
                    <div className="w-16 h-16 bg-[#C6A15B]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Download className="w-8 h-8 text-[#C6A15B]" />
                    </div>
                    <h2 className="font-display text-3xl md:text-5xl italic mb-6">
                        Ready to Build Your Knowledge Base?
                    </h2>
                    <p className="text-[#E9DED0] mb-10 text-lg max-w-xl mx-auto">
                        Pick a template and customize it for your team. It takes less than 5 minutes to get started.
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-flex px-8 py-4 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-all items-center gap-2 font-mono text-sm font-semibold shadow-lg"
                    >
                        Get Started for Free
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                    <p className="text-sm text-[#806B58] mt-6">No credit card required · Free forever plan available</p>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="px-6 py-12 border-t border-[#3A2418]/10 bg-[#F4EDE1]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-lg tracking-tight text-[#3A2418]">VEQ</span>
                    </div>
                    <div className="flex gap-6 text-sm text-[#806B58]">
                        <Link href="/knowledge-management-system" className="hover:text-[#3A2418]">Knowledge Management</Link>
                        <Link href="/templates" className="hover:text-[#3A2418]">Templates</Link>
                        <Link href="/dashboard" className="hover:text-[#3A2418]">Dashboard</Link>
                    </div>
                    <p className="text-xs font-mono text-[#806B58]">
                        © {new Date().getFullYear()} VEQ. All rights reserved.
                    </p>
                </div>
            </footer>
        </main>
    )
}