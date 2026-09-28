// app/dashboard/audit-logs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ScrollText, User, Clock, Activity } from 'lucide-react';

interface AuditLog {
    id: string;
    user_name: string;
    action: string;
    entity_type: string;
    details: string;
    created_at: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/audit-logs');
            const data = await res.json();
            if (res.ok) setLogs(data.logs || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-[#806B58]">Loading Audit Logs...</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-display text-[#3A2418] italic flex items-center gap-3">
                    <ScrollText className="w-8 h-8 text-[#C6A15B]" /> Audit Logs
                </h1>
                <p className="text-[#806B58] mt-2">Track every action taken within your workspace.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#E9DED0] overflow-hidden shadow-sm">
                {logs.length === 0 ? (
                    <div className="text-center py-16">
                        <Activity className="w-12 h-12 text-[#806B58] mx-auto mb-3 opacity-50" />
                        <p className="text-[#806B58] font-medium">No activity recorded yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-[#E9DED0]">
                        {logs.map((log) => (
                            <div key={log.id} className="p-5 flex items-center justify-between hover:bg-[#F4EDE1]/30 transition">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-[#F4EDE1] rounded-lg">
                                        <User className="w-5 h-5 text-[#806B58]" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-[#3A2418]">
                                            <span className="font-bold">{log.user_name || 'Unknown'}</span> {log.action}
                                        </p>
                                        <p className="text-xs text-[#806B58] font-mono mt-0.5">
                                            {log.entity_type && <span className="uppercase bg-[#E9DED0] px-1.5 py-0.5 rounded text-[10px] mr-2">{log.entity_type}</span>}
                                            {log.details}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[#806B58] font-mono">
                                    <Clock className="w-3 h-3" />
                                    {new Date(log.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}