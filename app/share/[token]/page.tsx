// app/share/[token]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { FileText, Calendar, ShieldCheck, ExternalLink } from 'lucide-react'

export default async function SharedKnowledgePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient() // Uses Service Role Key internally if configured, or standard client

    // 1. Verify the token
    const { data: shareData } = await supabase
        .from('shared_links')
        .select('knowledge_id')
        .eq('token', token)
        .single()

    if (!shareData) {
        notFound() // Agar token galat hai, toh 404 dikhao
    }

    // 2. Fetch the actual knowledge item
    const { data: knowledge } = await supabase
        .from('employee_knowledge')
        .select('*')
        .eq('id', shareData.knowledge_id)
        .single()

    if (!knowledge) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-[#F4EDE1] flex flex-col">
            {/* Header */}
            <header className="border-b border-[#E9DED0] bg-white/60 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-[#C6A15B]" />
                        <span className="font-mono text-xs text-[#806B58] uppercase tracking-widest">Secure Shared Document</span>
                    </div>
                    <a
                        href="https://veq.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[#3A2418] hover:text-[#C6A15B] transition-colors font-mono text-xs font-semibold"
                    >
                        Powered by VEQ <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
                <div className="rounded-2xl border border-[#E9DED0] bg-white/80 p-8 md:p-12 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full text-xs font-mono bg-[#C6A15B]/20 text-[#3A2418] flex items-center gap-1">
                            <FileText className="w-3 h-3" /> {knowledge.source_type === "document" ? "Document" : "Manual Entry"}
                        </span>
                        <span className="text-xs text-[#806B58] font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(knowledge.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>

                    <h1 className="font-display text-3xl md:text-4xl text-[#3A2418] italic mb-8">
                        {knowledge.source_reference || "Untitled Knowledge"}
                    </h1>

                    <div className="prose prose-stone max-w-none text-[#3A2418]/90 leading-relaxed whitespace-pre-wrap">
                        {knowledge.content}
                    </div>

                    {knowledge.metadata?.tags && knowledge.metadata.tags.length > 0 && (
                        <div className="mt-10 pt-6 border-t border-[#E9DED0]">
                            <p className="text-xs font-mono text-[#806B58] mb-3 uppercase">Tags</p>
                            <div className="flex flex-wrap gap-2">
                                {knowledge.metadata.tags.map((tag: string, idx: number) => (
                                    <span key={idx} className="px-3 py-1 rounded-lg text-xs font-mono border border-[#E9DED0] bg-[#F4EDE1] text-[#3A2418]">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Viral Footer */}
            <footer className="border-t border-[#E9DED0] bg-white/40 py-6 text-center">
                <p className="font-mono text-xs text-[#806B58]">
                    This document is securely shared via <span className="font-bold text-[#3A2418]">VEQ</span> Knowledge Continuity Platform.
                </p>
            </footer>
        </div>
    )
}