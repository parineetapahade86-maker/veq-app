// app/dashboard/automations/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Zap, Plus, Power, PowerOff, Loader2 } from 'lucide-react';

interface AutomationRule {
    id: string;
    name: string;
    trigger_event: string;
    action_type: string;
    is_active: boolean;
}

export default function AutomationsPage() {
    const [rules, setRules] = useState<AutomationRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [trigger, setTrigger] = useState('new_knowledge_item');
    const [action, setAction] = useState('send_webhook');

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await fetch('/api/automations');
            const data = await res.json();
            if (res.ok) setRules(data.rules || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/automations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, trigger_event: trigger, action_type: action })
            });
            if (res.ok) {
                setShowForm(false);
                setName('');
                fetchRules();
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="p-10 text-center text-[#806B58]">Loading Automations...</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-10">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-display text-[#3A2418] italic flex items-center gap-3">
                        <Zap className="w-8 h-8 text-[#C6A15B]" /> Automated Workflows
                    </h1>
                    <p className="text-[#806B58] mt-2">Set rules to automate your knowledge continuity.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-[#3A2418] text-[#F4EDE1] px-4 py-2 rounded-xl hover:bg-[#4A2F20] transition flex items-center gap-2 font-mono text-sm font-semibold"
                >
                    <Plus className="w-4 h-4" /> New Rule
                </button>
            </div>

            {/* Create Rule Form */}
            {showForm && (
                <div className="bg-white p-6 rounded-2xl border border-[#E9DED0] mb-8 shadow-sm">
                    <h2 className="text-xl font-display text-[#3A2418] italic mb-4">Create Automation Rule</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <input
                            type="text" placeholder="Rule Name (e.g., Alert on Risk)"
                            value={name} onChange={(e) => setName(e.target.value)} required
                            className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B]"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-mono text-[#806B58] uppercase mb-1 block">WHEN THIS HAPPENS (Trigger)</label>
                                <select
                                    value={trigger} onChange={(e) => setTrigger(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B]"
                                >
                                    <option value="new_knowledge_item">New Knowledge Item Added</option>
                                    <option value="risk_detected">AI Detects Knowledge Risk</option>
                                    <option value="meeting_logged">Meeting Logged</option>
                                    <option value="employee_offboarded">Employee Offboarded</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-mono text-[#806B58] uppercase mb-1 block">DO THIS (Action)</label>
                                <select
                                    value={action} onChange={(e) => setAction(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B]"
                                >
                                    <option value="send_webhook">Send Webhook (Zapier/Slack)</option>
                                    <option value="notify_team">Notify Team via Email</option>
                                    <option value="create_task">Create Follow-up Task</option>
                                </select>
                            </div>
                        </div>
                        <button type="submit" className="bg-[#C6A15B] text-white px-6 py-3 rounded-xl hover:bg-[#b08d4b] transition font-semibold w-full">
                            Save Automation Rule
                        </button>
                    </form>
                </div>
            )}

            {/* Rules List */}
            <div className="space-y-4">
                {rules.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-[#E9DED0]">
                        <Zap className="w-12 h-12 text-[#806B58] mx-auto mb-3 opacity-50" />
                        <p className="text-[#806B58] font-medium">No active automations.</p>
                        <p className="text-sm text-[#806B58]">Create a rule to put VEQ on autopilot.</p>
                    </div>
                ) : (
                    rules.map((rule) => (
                        <div key={rule.id} className="bg-white p-5 rounded-xl border border-[#E9DED0] flex items-center justify-between hover:border-[#C6A15B] transition">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-lg ${rule.is_active ? 'bg-[#C6A15B]/10' : 'bg-gray-100'}`}>
                                    {rule.is_active ? <Zap className="w-6 h-6 text-[#C6A15B]" /> : <PowerOff className="w-6 h-6 text-gray-400" />}
                                </div>
                                <div>
                                    <h3 className="font-medium text-[#3A2418]">{rule.name}</h3>
                                    <p className="text-xs text-[#806B58] font-mono mt-1">
                                        When <span className="text-[#3A2418] font-semibold">{rule.trigger_event.replace(/_/g, ' ')}</span> happens → <span className="text-[#3A2418] font-semibold">{rule.action_type.replace(/_/g, ' ')}</span>
                                    </p>
                                </div>
                            </div>
                            <button className="text-xs bg-[#3A2418] text-[#F4EDE1] px-3 py-1.5 rounded-lg hover:bg-[#4A2F20] transition">
                                Edit
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}