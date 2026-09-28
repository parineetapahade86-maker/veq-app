// app/dashboard/marketplace/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Star, Download, CreditCard, Loader2 } from 'lucide-react';

interface MarketplaceItem {
    id: string;
    title: string;
    description: string;
    category: string;
    industry: string;
    price_credits: number;
    author_name: string;
    download_count: number;
}

export default function MarketplacePage() {
    const [items, setItems] = useState<MarketplaceItem[]>([]);
    const [credits, setCredits] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/marketplace');
            const data = await res.json();
            if (res.ok) {
                setItems(data.items);
                setCredits(data.userCredits);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePublish = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/marketplace', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category, description, price_credits: price })
            });
            if (res.ok) {
                setShowForm(false);
                setTitle(''); setCategory(''); setDescription(''); setPrice(0);
                fetchData();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center text-[#806B58]">Loading Marketplace...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display text-[#3A2418] italic flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8 text-[#C6A15B]" /> Knowledge Marketplace
                    </h1>
                    <p className="text-[#806B58] mt-2">Share best practices, earn credits, and grow together.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-4 py-2 rounded-xl border border-[#E9DED0] flex items-center gap-2 shadow-sm">
                        <CreditCard className="w-4 h-4 text-[#C6A15B]" />
                        <span className="font-bold text-[#3A2418]">{credits}</span>
                        <span className="text-xs text-[#806B58]">Credits</span>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-[#3A2418] text-[#F4EDE1] px-4 py-2 rounded-xl hover:bg-[#4A2F20] transition flex items-center gap-2 font-mono text-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" /> Share Knowledge
                    </button>
                </div>
            </div>

            {/* Publish Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] mb-8 shadow-sm">
                    <h2 className="text-xl font-display text-[#3A2418] italic mb-4">Publish a New Template</h2>
                    <form onSubmit={handlePublish} className="space-y-4">
                        <input
                            type="text" placeholder="Template Title (e.g., Q3 Sales Playbook)"
                            value={title} onChange={(e) => setTitle(e.target.value)} required
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B]"
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <input
                                type="text" placeholder="Category (e.g., Sales, HR, Tech)"
                                value={category} onChange={(e) => setCategory(e.target.value)} required
                                className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B]"
                            />
                            <input
                                type="number" placeholder="Price in Credits (0 for free)"
                                value={price} onChange={(e) => setPrice(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B]"
                            />
                        </div>
                        <textarea
                            placeholder="Description & Content..."
                            value={description} onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] h-32"
                        />
                        <button type="submit" className="bg-[#C6A15B] text-white px-6 py-3 rounded-xl hover:bg-[#b08d4b] transition font-semibold">
                            Publish to Marketplace
                        </button>
                    </form>
                </div>
            )}

            {/* Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.length === 0 ? (
                    <div className="col-span-3 text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E9DED0]">
                        <ShoppingBag className="w-12 h-12 text-[#806B58] mx-auto mb-3 opacity-50" />
                        <p className="text-[#806B58] font-medium">No templates yet. Be the first to share!</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl border border-[#E9DED0] hover:border-[#C6A15B] transition shadow-sm flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono bg-[#F4EDE1] text-[#806B58] px-2 py-1 rounded-md uppercase tracking-wider">
                                    {item.category}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-[#C6A15B]">
                                    <Star className="w-3 h-3 fill-[#C6A15B]" /> {item.price_credits} Cr
                                </span>
                            </div>
                            <h3 className="text-lg font-display text-[#3A2418] italic mb-2">{item.title}</h3>
                            <p className="text-sm text-[#806B58] mb-6 flex-1 line-clamp-3">{item.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-[#E9DED0]">
                                <span className="text-xs text-[#806B58]">By {item.author_name}</span>
                                <button className="text-xs bg-[#3A2418] text-[#F4EDE1] px-3 py-1.5 rounded-lg hover:bg-[#4A2F20] transition flex items-center gap-1">
                                    <Download className="w-3 h-3" /> Get
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}