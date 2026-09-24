'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase';
import {
    CheckCircle2, Calendar, BookOpen, Activity, Sparkles,
    AlertTriangle, Lightbulb, Clock, TrendingUp, Users, Link as LinkIcon
} from 'lucide-react';

export default function DashboardPage() {
    const { user, isLoaded } = useUser();
    const supabase = createClient();

    const [stats, setStats] = useState({ activeTasks: 0, meetingsLogged: 0, knowledgeItems: 0 });
    const [activities, setActivities] = useState<any[]>([]);
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isLoaded || !user) return;

        const fetchRealData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 1. PARALLEL REAL DATA FETCH (Lightning Fast)
                const [tasksRes, meetingsRes, knowledgeRes, activitiesRes, suggestionsRes] = await Promise.all([
                    supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active'),
                    supabase.from('meetings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('knowledge_items').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
                    supabase.from('activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
                    supabase.from('ai_agent_suggestions').select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(5)
                ]);

                // 2. SET REAL STATS (No fake data, ever)
                setStats({
                    activeTasks: tasksRes.count || 0,
                    meetingsLogged: meetingsRes.count || 0,
                    knowledgeItems: knowledgeRes.count || 0
                });

                // 3. SET REAL ACTIVITIES (Agar empty hai, toh empty array rahega)
                setActivities(activitiesRes.data || []);

                // 4. SET REAL AI SUGGESTIONS
                setAiSuggestions(suggestionsRes.data || []);

            } catch (err) {
                console.error('Dashboard fetch error:', err);
                setError('Failed to load real-time data. Please check your connection.');
            } finally {
                setLoading(false);
            }
        };

        fetchRealData();
    }, [user, isLoaded]);

    // REAL AI SCAN TRIGGER
    const runAIScan = async () => {
        if (!user) return;
        setAiLoading(true);
        try {
            const response = await fetch('/api/ai-agents/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }) // Real user ID bhejo
            });

            const data = await response.json();
            if (data.success) {
                // Refresh real suggestions after scan
                const { data: newSuggestions } = await supabase
                    .from('ai_agent_suggestions')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })
                    .limit(5);
                if (newSuggestions) setAiSuggestions(newSuggestions);
            }
        } catch (err) {
            console.error('AI Scan error:', err);
        } finally {
            setAiLoading(false);
        }
    };

    // Helper: Icon mapping for activities
    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'integration': return <LinkIcon className="w-5 h-5 text-green-600" />;
            case 'meeting': return <Calendar className="w-5 h-5 text-blue-600" />;
            case 'knowledge': return <BookOpen className="w-5 h-5 text-purple-600" />;
            default: return <Activity className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (!isLoaded || loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading your real workspace data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                    Welcome back, {user?.firstName || 'Founder'}! 👋
                </h1>
                <p className="text-gray-600">Here is your real-time knowledge continuity status.</p>
            </div>

            {/* Error Message (Only shows if real error occurs) */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {/* REAL STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-lg"><CheckCircle2 className="w-6 h-6 text-blue-600" /></div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeTasks}</h3>
                    <p className="text-gray-600 text-sm font-medium">Active Tasks</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-50 rounded-lg"><Calendar className="w-6 h-6 text-purple-600" /></div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.meetingsLogged}</h3>
                    <p className="text-gray-600 text-sm font-medium">Meetings Logged</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-amber-50 rounded-lg"><BookOpen className="w-6 h-6 text-amber-600" /></div>
                        <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.knowledgeItems}</h3>
                    <p className="text-gray-600 text-sm font-medium">Knowledge Items</p>
                </div>
            </div>

            {/* MAIN CONTENT GRID (AI + Activity) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* REAL AI AGENTS PANEL */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg"><Sparkles className="w-6 h-6 text-purple-600" /></div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">VEQ AI Agents</h2>
                                <p className="text-sm text-gray-500">Intelligent insights for continuity</p>
                            </div>
                        </div>
                        <button
                            onClick={runAIScan}
                            disabled={aiLoading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                        >
                            {aiLoading ? (
                                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Scanning...</>
                            ) : (
                                <><Sparkles className="w-4 h-4" /> Run AI Scan</>
                            )}
                        </button>
                    </div>

                    {aiSuggestions.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No pending AI insights.</p>
                            <p className="text-sm text-gray-400 mt-1">Your knowledge base is clean! Run a scan to check for gaps.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {aiSuggestions.map((suggestion) => (
                                <div key={suggestion.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                                    {suggestion.agent_type === 'gap_detector' ? <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" /> : <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5" />}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900 text-sm">{suggestion.title}</h3>
                                            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${suggestion.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                }`}>{suggestion.priority}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* REAL RECENT ACTIVITY (Team Collaboration Hub Preview) */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-100 rounded-lg"><Activity className="w-6 h-6 text-green-600" /></div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
                            <p className="text-sm text-gray-500">Latest updates from your workspace</p>
                        </div>
                    </div>

                    {activities.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No recent activity yet.</p>
                            <p className="text-sm text-gray-400 mt-1">Connect your first integration to see real-time updates!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activities.map((activity) => (
                                <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition">
                                    <div className="mt-1">{getActivityIcon(activity.type)}</div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 text-sm">{activity.title}</h3>
                                        <p className="text-sm text-gray-600 mt-0.5">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-500 font-medium">{activity.user || 'System'}</span>
                                            <span className="text-xs text-gray-300">•</span>
                                            <span className="text-xs text-gray-400">{formatTime(activity.timestamp || activity.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
    4
}