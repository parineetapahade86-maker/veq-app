import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { notFound } from "next/navigation"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
    // Fetch specific article by slug
    const { data: article, error } = await supabase
        .from("knowledge_articles")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_public", true)
        .single()

    if (error || !article) {
        notFound() // Shows 404 if article doesn't exist or is private
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418] font-sans">
            <nav className="border-b border-[#3A2418]/10 bg-[#F4EDE1]/95 backdrop-blur-sm">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/help" className="flex items-center gap-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418]">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Help Center
                    </Link>
                    <span className="font-display text-lg tracking-tight text-[#3A2418] font-bold italic">VEQ Help</span>
                </div>
            </nav>

            <article className="max-w-3xl mx-auto px-6 py-16">
                <span className="inline-block px-3 py-1 bg-[#C6A15B]/10 text-[#C6A15B] rounded-full text-xs font-mono mb-4">
                    {article.category}
                </span>

                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-6">
                    {article.title}
                </h1>

                <div className="flex items-center gap-2 text-sm text-[#806B58] mb-10 font-mono">
                    <Calendar className="w-4 h-4" />
                    Last updated: {new Date(article.created_at).toLocaleDateString()}
                </div>

                <div className="prose prose-lg max-w-none text-[#3A2418] leading-relaxed bg-white p-8 md:p-12 rounded-2xl border border-[#E9DED0] shadow-sm">
                    {/* In a real app, you'd use a Markdown renderer here. For now, we display the text. */}
                    <p className="whitespace-pre-wrap">{article.content}</p>
                </div>

                {/* Feedback Section */}
                <div className="mt-12 p-6 bg-[#C6A15B]/5 rounded-xl border border-[#C6A15B]/20 text-center">
                    <p className="font-display text-xl text-[#3A2418] italic mb-4">Was this article helpful?</p>
                    <div className="flex justify-center gap-4">
                        <button className="px-6 py-2 bg-white border border-[#E9DED0] rounded-lg hover:bg-[#C6A15B] hover:text-white hover:border-[#C6A15B] transition-colors font-mono text-sm">
                            Yes, it helped!
                        </button>
                        <button className="px-6 py-2 bg-white border border-[#E9DED0] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-mono text-sm">
                            No, I need more info
                        </button>
                    </div>
                </div>
            </article>
        </main>
    )
}