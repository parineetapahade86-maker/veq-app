// components/AgentInbox.tsx
"use client";

import { useState, useEffect } from "react";
import { Bot, CheckCircle, XCircle, FileText, Loader2 } from "lucide-react";

interface Suggestion {
    id: string;
    action_type: string;
    title: string;
    description: string;
}

export default function AgentInbox({ companyId }: { companyId: string | null }) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (companyId) fetchSuggestions();
        else setLoading(false);
    }, [companyId]);

    const fetchSuggestions = async () => {
        try {
            const res = await fetch("/api/agent-remediation");
            const data = await res.json();
            if (res.ok) setSuggestions(data.suggestions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "dismiss") => {
        setProcessing(id);
        try {
            const res = await fetch("/api/agent-remediation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ suggestionId: id, action }),
            });
            if (res.ok) {
                setSuggestions((prev) => prev.filter((s) => s.id !== id));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setProcessing(null);
        }
    };

    if (loading || !companyId) return null;
    if (suggestions.length === 0) return null; // Hide if no actions needed

    return (
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Bot className="w-5 h-5 text-[#C6A15B]" />
                <h2 className="font-display text-2xl text-[#3A2418] italic">AI Agent Inbox</h2>
                <span className="bg-[#C6A15B] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {suggestions.length}
                </span>
            </div>

            <div className="space-y-4">
                {suggestions.map((item) => (
                    <div key={item.id} className="rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-[#C6A15B]/10 rounded-lg shrink-0">
                                <FileText className="w-5 h-5 text-[#C6A15B]" />
                            </div>
                            <div>
                                <h3 className="font-display text-lg text-[#3A2418] italic">{item.title}</h3>
                                <p className="text-sm text-[#806B58] mt-1">{item.description}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                            <button
                                onClick={() => handleAction(item.id, "dismiss")}
                                disabled={processing === item.id}
                                className="px-4 py-2 text-sm font-mono text-[#806B58] hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
                            >
                                {processing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                Dismiss
                            </button>
                            <button
                                onClick={() => handleAction(item.id, "approve")}
                                disabled={processing === item.id}
                                className="px-4 py-2 bg-[#3A2418] text-[#F4EDE1] text-sm font-mono rounded-lg hover:bg-[#4A2F20] transition flex items-center gap-2 shadow-sm"
                            >
                                {processing === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                Approve & Draft
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}