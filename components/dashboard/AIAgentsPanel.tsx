'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Sparkles, AlertTriangle, Lightbulb, Clock, Check, X } from 'lucide-react';

export default function AIAgentsPanel() {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    // Fetch suggestions on load
    useEffect(() => {
        fetchSuggestions();
    }, []);

    const fetchSuggestions = async () => {
        const { data, error } = await supabase
            .from('ai_agent_suggestions')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5);

        if (data) setSuggestions(data);
    };

    const runAIScan = async () => {
        setLoading(true);
        await fetch('/api/ai-agents/scan', {
            method: 'POST',
            body: JSON.stringify({ companyId: 'YOUR_COMPANY_ID', recentActivities: [] })
        });
        await fetchSuggestions();
        setLoading(false);
    };

    const getIcon = (type: string) => {
        if (type === 'gap_detector') return <AlertTriangle className="text-red-500" />;
        if (type === 'proactive_helper') return <Lightbulb className="text-yellow-500" />;
        if (type === 'reminder') return <Clock className="text-blue-500" />;
        return <Sparkles className="text-purple-500" />;
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Sparkles className="text-purple-600 w-6 h-6" />
                    <h2 className="text-xl font-bold text-gray-800">VEQ AI Agents</h2>
                </div>
                <button
                    onClick={runAIScan}
                    disabled={loading}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
                >
                    {loading ? 'Scanning...' : 'Run AI Scan'}
                </button>
            </div>

            <div className="space-y-4">
                {suggestions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No pending AI insights. Run a scan to find knowledge gaps!</p>
                ) : (
                    suggestions.map((item) => (
                        <div key={item.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="mt-1">{getIcon(item.agent_type)}</div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                <div className="flex gap-2 mt-3">
                                    <button className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200">
                                        <Check size={12} /> Accept
                                    </button>
                                    <button className="flex items-center gap-1 text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-300">
                                        <X size={12} /> Dismiss
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}