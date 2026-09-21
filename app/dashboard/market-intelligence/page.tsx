"use client"

import { useState } from "react"
import { TrendingUp, Users, Lightbulb, Map, Zap, ArrowRight, Loader2, BarChart3, Target, TrendingDown, Minus } from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function MarketIntelligencePage() {
    const [step, setStep] = useState<'form' | 'loading' | 'dashboard'>('form')
    const [formData, setFormData] = useState({
        industry: "",
        products: "",
        targetAudience: "",
        competitors: ""
    })
    const [intelligence, setIntelligence] = useState<any>(null)

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setStep('loading')

        try {
            const response = await fetch('/api/market-intelligence', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const result = await response.json()

            if (result.success) {
                setIntelligence(result.data)
                setStep('dashboard')
            } else {
                alert("Failed to generate intelligence. Please try again.")
                setStep('form')
            }
        } catch (err) {
            console.error(err)
            alert("Network error. Please try again.")
            setStep('form')
        }
    }

    // Prepare chart data from API response
    const chartData = intelligence?.marketGrowth?.map((month: any) => ({
        month: month.month,
        growth: month.trend === 'up' ? 75 : month.trend === 'down' ? 35 : 55,
        trend: month.trend
    })) || []

    // --- FORM VIEW ---
    if (step === 'form') {
        return (
            <section className="max-w-3xl mx-auto px-6 py-16">
                <div className="mb-8">
                    <h1 className="font-display text-4xl text-[#3A2418] italic mb-2">AI Market Intelligence</h1>
                    <p className="text-[#806B58]">Tell us about your business. Our AI will analyze the market, detect opportunities, and build your growth roadmap.</p>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6 bg-white p-8 rounded-2xl border border-[#E9DED0] shadow-lg">
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">Industry *</label>
                        <input required type="text" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} placeholder="e.g., SaaS, Eco-friendly Packaging, FinTech" className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">Products / Services *</label>
                        <input required type="text" value={formData.products} onChange={(e) => setFormData({ ...formData, products: e.target.value })} placeholder="e.g., Modular storage boxes, AI scheduling software" className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">Target Audience *</label>
                        <input required type="text" value={formData.targetAudience} onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })} placeholder="e.g., Urban millennials, Small business owners" className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] transition-all" />
                    </div>
                    <div>
                        <label className="block text-sm font-mono text-[#806B58] mb-2">Main Competitors (Optional)</label>
                        <input type="text" value={formData.competitors} onChange={(e) => setFormData({ ...formData, competitors: e.target.value })} placeholder="e.g., Brand A, Brand B" className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] transition-all" />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#3A2418] to-[#4A2F20] text-[#F4EDE1] rounded-xl hover:from-[#4A2F20] hover:to-[#5A3F30] transition-all flex items-center justify-center gap-2 font-mono text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                        <Zap className="w-5 h-5 text-[#C6A15B]" /> Generate Market Intelligence
                    </button>
                </form>
            </section>
        )
    }

    // --- LOADING VIEW ---
    if (step === 'loading') {
        return (
            <section className="max-w-3xl mx-auto px-6 py-32 text-center">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-[#E9DED0] border-t-[#C6A15B] rounded-full animate-spin mx-auto mb-6"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Zap className="w-6 h-6 text-[#C6A15B]" />
                    </div>
                </div>
                <h2 className="font-display text-2xl text-[#3A2418] italic mb-2">AI is Analyzing the Market...</h2>
                <p className="text-[#806B58] font-mono text-sm">Scanning trends, mapping competitors, and detecting opportunities.</p>
            </section>
        )
    }

    // --- DASHBOARD VIEW ---
    return (
        <section className="max-w-7xl mx-auto px-6 py-16 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-4xl text-[#3A2418] italic mb-2">Market Intelligence Dashboard</h1>
                    <p className="text-[#806B58]">Real-time insights and growth opportunities for: <span className="font-bold text-[#3A2418]">{formData.industry}</span></p>
                </div>
                <button onClick={() => setStep('form')} className="px-6 py-3 bg-white border border-[#E9DED0] rounded-xl text-sm font-mono text-[#806B58] hover:bg-[#F4EDE1] hover:border-[#C6A15B] transition-all shadow-sm">Update Details</button>
            </div>

            {/* 1. KEY INSIGHTS - Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {intelligence?.keyInsights?.map((insight: any, idx: number) => (
                    <div key={idx} className="group p-6 bg-gradient-to-br from-white to-[#F4EDE1]/50 rounded-2xl border border-[#E9DED0] shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1">
                        <div className="flex items-start gap-4">
                            <div className="text-3xl transform group-hover:scale-110 transition-transform">{insight.icon}</div>
                            <p className="text-sm text-[#3A2418] font-medium leading-relaxed">{insight.text}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 2. AESTHETIC MARKET GROWTH CHART */}
                <div className="lg:col-span-2 bg-gradient-to-br from-white to-[#F4EDE1]/30 p-8 rounded-3xl border border-[#E9DED0] shadow-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#C6A15B]/10 rounded-xl">
                            <BarChart3 className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-2xl text-[#3A2418] italic">Market Growth Trajectory</h3>
                    </div>

                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#C6A15B" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#C6A15B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E9DED0" vertical={false} />
                                <XAxis dataKey="month" stroke="#806B58" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#806B58" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#3A2418',
                                        border: 'none',
                                        borderRadius: '12px',
                                        color: '#F4EDE1',
                                        fontSize: '14px',
                                        fontWeight: '500'
                                    }}
                                    // ✅ FIX: 'number' ko 'any' kar diya taaki TypeScript error na aaye
                                    formatter={(value: any) => [`${value}% Growth`, 'Market Activity']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="growth"
                                    stroke="#C6A15B"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorGrowth)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Growth Explanations */}
                    <div className="mt-6 space-y-3">
                        {intelligence?.marketGrowth?.map((month: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-white/60 rounded-xl border border-[#E9DED0]/50">
                                {month.trend === 'up' ? (
                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                ) : month.trend === 'down' ? (
                                    <TrendingDown className="w-5 h-5 text-red-500" />
                                ) : (
                                    <Minus className="w-5 h-5 text-yellow-600" />
                                )}
                                <span className="font-mono text-sm font-bold text-[#3A2418] w-16">{month.month}</span>
                                <span className="text-sm text-[#806B58] italic">{month.explanation}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. AI MIND MAP - Enhanced */}
                <div className="bg-gradient-to-br from-[#3A2418] to-[#4A2F20] p-8 rounded-3xl border border-[#E9DED0]/30 shadow-lg text-[#F4EDE1]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#C6A15B]/20 rounded-xl">
                            <Map className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-2xl italic">AI Mind Map</h3>
                    </div>
                    <div className="space-y-6">
                        {intelligence?.mindMap && Object.entries(intelligence.mindMap).map(([category, items]: [string, any]) => (
                            <div key={category} className="relative">
                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#C6A15B] to-transparent"></div>
                                <h4 className="font-mono text-xs uppercase tracking-wider text-[#C6A15B] mb-3 pl-4">{category}</h4>
                                <ul className="space-y-2 pl-4">
                                    {items.map((item: string, i: number) => (
                                        <li key={i} className="text-sm flex items-start gap-3 animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                                            <div className="mt-2 w-2 h-2 rounded-full bg-[#C6A15B] shadow-lg shadow-[#C6A15B]/50 shrink-0"></div>
                                            <span className="leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 4. OPPORTUNITIES & NEXT STEPS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-3xl border border-[#E9DED0] shadow-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#C6A15B]/10 rounded-xl">
                            <Lightbulb className="w-6 h-6 text-[#C6A15B]" />
                        </div>
                        <h3 className="font-display text-2xl text-[#3A2418] italic">Detected Opportunities</h3>
                    </div>
                    <div className="space-y-4">
                        {intelligence?.opportunities?.map((opp: any, idx: number) => (
                            <div key={idx} className="group p-5 bg-gradient-to-r from-[#F4EDE1]/60 to-white rounded-2xl border border-[#E9DED0] hover:border-[#C6A15B] hover:shadow-md transition-all">
                                <div className="flex items-start gap-3">
                                    <Target className="w-5 h-5 text-[#C6A15B] mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-xs font-mono text-[#806B58] mb-2 uppercase tracking-wider">SIGNAL: {opp.signal}</p>
                                        <p className="text-sm font-semibold text-[#3A2418] leading-relaxed">{opp.insight}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gradient-to-br from-[#C6A15B]/20 via-[#F4EDE1] to-white p-8 rounded-3xl border-2 border-[#C6A15B]/30 shadow-lg">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-[#3A2418] rounded-xl">
                            <Zap className="w-6 h-6 text-[#F4EDE1]" />
                        </div>
                        <h3 className="font-display text-2xl text-[#3A2418] italic">What Should We Do Next?</h3>
                    </div>
                    <div className="space-y-4">
                        {intelligence?.nextSteps?.map((step: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl border border-[#E9DED0] hover:border-[#C6A15B] hover:shadow-md transition-all group">
                                <div className="p-2 bg-[#3A2418] rounded-lg group-hover:bg-[#4A2F20] transition-colors">
                                    <ArrowRight className="w-4 h-4 text-[#F4EDE1]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#3A2418] mb-1">{step.action}</p>
                                    <p className="text-xs text-[#806B58] leading-relaxed">{step.impact}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}