'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase';
import {
    FileText, Clock, User, Shield, CheckCircle2,
    AlertCircle, History, MessageSquare, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
// Note: Make sure you created this component as discussed earlier!
import RealtimeComments from '@/components/dashboard/RealtimeComments';

interface KnowledgeItem {
    id: string;
    title: string;
    content: string;
    status: string; // 'draft', 'pending_review', 'approved'
    author_id: string;
    created_at: string;
    updated_at: string;
}

interface DocumentVersion {
    id: string;
    version_number: number;
    content: string;
    created_at: string;
    user_id: string;
}

export default function KnowledgeItemPage() {
    const params = useParams();
    const { user } = useUser();
    const supabase = createClient();
    const id = params.id as string;

    const [item, setItem] = useState<KnowledgeItem | null>(null);
    const [versions, setVersions] = useState<DocumentVersion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 1. Fetch Main Knowledge Item
                const { data: itemData, error: itemError } = await supabase
                    .from('knowledge_items')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (itemError) throw itemError;
                setItem(itemData);

                // 2. Fetch Version History
                const { data: versionsData, error: versionsError } = await supabase
                    .from('document_versions')
                    .select('*')
                    .eq('knowledge_item_id', id)
                    .order('version_number', { ascending: false });

                if (versionsError) throw versionsError;
                setVersions(versionsData || []);

            } catch (err: any) {
                console.error('Fetch error:', err);
                setError(err.message || 'Failed to load knowledge item.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Helper for Status Badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle2 size={12} /> Approved</span>;
            case 'pending_review':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} /> Pending Review</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><FileText size={12} /> Draft</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading knowledge item...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Knowledge Item Not Found</h2>
                    <p className="text-gray-600 mb-6">{error || 'The document you are looking for does not exist or you do not have access.'}</p>
                    <Link href="/dashboard/knowledge" className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition">
                        Back to Knowledge Base
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Top Navigation & Header */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard/knowledge" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
                        <ArrowLeft className="w-4 h-4" /> Back to Knowledge Base
                    </Link>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(item.status)}
                    </div>
                </div>

                {/* Main Document Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

                    <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>Author: {item.author_id === user?.id ? 'You' : 'Team Member'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            <span>Last Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                        </div>
                    </div>

                    {/* Document Content */}
                    <div className="prose prose-lg max-w-none mt-8 text-gray-700 whitespace-pre-wrap">
                        {item.content || "This document is currently empty."}
                    </div>
                </div>

                {/* Grid: Version History & Collaboration */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Version History (1/3 width) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <History className="w-5 h-5 text-amber-600" />
                            <h2 className="text-lg font-bold text-gray-900">Version History</h2>
                        </div>

                        {versions.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                <History className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                <p className="text-sm text-gray-500">No previous versions yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {versions.map((version) => (
                                    <div key={version.id} className="relative pl-6 border-l-2 border-gray-200 pb-4 last:border-0 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-amber-100 border-2 border-amber-600"></div>
                                        <p className="text-sm font-semibold text-gray-900">Version {version.version_number}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Saved on {new Date(version.created_at).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                                            {version.content.substring(0, 100)}...
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Real-time Comments (2/3 width) */}
                    <div className="lg:col-span-2">
                        <RealtimeComments knowledgeItemId={id} />
                    </div>

                </div>
            </div>
        </div>
    );
}