import { createClient } from "@supabase/supabase-js"
import Link from "next/link"
import { Search, BookOpen, FileText, ArrowRight } from "lucide-react"

// Initialize Supabase
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 1. ✅ YE TYPE DEFINITION TS ERRORS KO FIX KAREGI
type Article = {
    id: string
    title: string
    slug: string
    category: string
    content: string | null
    created_at: string
}

export default async function PublicHelpCenterPage() {
    // Fetch ONLY public articles from the database
    const { data: articles, error } = await supabase
        .from("knowledge_articles")
        .select("id, title, slug, category, content, created_at")
        .eq("is_public", true)
        .order("created_at", { ascending: false })

    // 2. ✅ PROPERLY TYPED GROUPED OBJECT
    const groupedArticles: Record<string, Article[]> = {}

    if (articles) {
        articles.forEach((article: Article) => {
            if (!groupedArticles[article.category]) {
                groupedArticles[article.category] = []
            }
            groupedArticles[article.category].push(article)
        })
    }

    return (
        <main className="min-h-screen bg-[#F4EDE1] text-[#3A2418] font-sans">

            {/* PUBLIC NAVBAR */}
            <nav className="sticky top-0 z-50 w-full border-b border-[#3A2418]/10 bg-[#F4EDE1]/95 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#C6A15B]" />
                        <span className="font-display text-xl tracking-tight text-[#3A2418] font-bold italic">VEQ Help</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-sm font-mono font-medium text-[#806B58] hover:text-[#3A2418]">
                            Back to VEQ Home
                        </Link>
                        <Link
                            href="/dashboard"
                            className="px-5 py-2.5 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] text-sm font-mono font-semibold transition-colors"
                        >
                            Login to Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* HERO SEARCH SECTION */}
            <section className="px-6 py-20 md:py-24 text-center max-w-3xl mx-auto">
                <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-6">
                    How can we help you?
                </h1>
                <p className="text-lg text-[#806B58] mb-10">
                    Search our knowledge base for answers, guides, and troubleshooting tips.
                </p>

                <div className="max-w-2xl mx-auto relative">
                    <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#806B58]" />
                    <input
                        type="text"
                        placeholder="Search for articles (e.g., 'billing', 'setup')..."
                        className="w-full pl-14 pr-4 py-4 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] shadow-sm text-lg"
                    />
                </div>
            </section>

            {/* ARTICLES GRID */}
            <section className="px-6 pb-24 max-w-5xl mx-auto">
                {error || !articles || articles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-[#E9DED0]">
                        <BookOpen className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
                        <h3 className="font-display text-2xl text-[#3A2418] italic mb-2">No public articles yet</h3>
                        <p className="text-[#806B58]">The company is currently updating their help center.</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {Object.entries(groupedArticles).map(([category, categoryArticles]) => (
                            <div key={category}>
                                <h2 className="font-display text-2xl text-[#3A2418] italic mb-6 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-[#C6A15B]" />
                                    {category}
                                </h2>

                                <div className="grid md:grid-cols-2 gap-4">
                                    {categoryArticles.map((article) => (
                                        <Link
                                            key={article.id}
                                            href={`/help/${article.slug}`}
                                            className="group p-6 rounded-xl border border-[#E9DED0] bg-white hover:border-[#C6A15B]/50 hover:shadow-md transition-all flex items-center justify-between"
                                        >
                                            <div>
                                                <h3 className="font-display text-lg text-[#3A2418] italic mb-1 group-hover:text-[#C6A15B] transition-colors">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-[#806B58] line-clamp-2">
                                                    {article.content ? article.content.substring(0, 100) + "..." : "Click to read more about this topic."}
                                                </p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 text-[#806B58] group-hover:text-[#C6A15B] group-hover:translate-x-1 transition-all shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* FOOTER */}
            <footer className="px-6 py-12 border-t border-[#3A2418]/10 bg-[#F4EDE1] text-center">
                <p className="text-xs font-mono text-[#806B58]">
                    © {new Date().getFullYear()} VEQ Knowledge Management. All rights reserved.
                </p>
            </footer>
        </main>
    )
}