"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Search, Mail, Briefcase, X, Save, Trash2, Brain, CheckCircle, Lock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

// Define the structure of a Knowledge Carrier
interface KnowledgeCarrier {
  id: string
  name: string
  role: string
  email: string
  department: string
  slackId?: string
  isHandoverInitiated?: boolean
  isLocked?: boolean // 🆕 Added for Step 5
}

export default function KnowledgeCarriersPage() {
  // State
  const [carriers, setCarriers] = useState<KnowledgeCarrier[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [newCarrier, setNewCarrier] = useState({
    name: "",
    role: "",
    email: "",
    department: "",
    slackId: ""
  })

  // 🚀 REAL DATA: Fetch from Supabase on page load
  useEffect(() => {
    const fetchCarriers = async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching carriers:", error);
      } else if (data) {
        const mappedData: KnowledgeCarrier[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          email: item.email,
          department: item.department,
          slackId: item.slack_id,
          isHandoverInitiated: item.is_handover_initiated,
          isLocked: item.is_locked || false // 🆕 Map lock status
        }));
        setCarriers(mappedData);
      }
      setIsLoading(false);
    };

    fetchCarriers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewCarrier(prev => ({ ...prev, [name]: value }))
  }

  // 🚀 REAL DATA: Save to Supabase Database
  const handleSaveCarrier = async () => {
    if (!newCarrier.name || !newCarrier.email) {
      alert("Name and Email are required!")
      return
    }

    const dbPayload = {
      name: newCarrier.name,
      role: newCarrier.role,
      email: newCarrier.email,
      department: newCarrier.department,
      slack_id: newCarrier.slackId
    }

    const { data, error } = await supabase
      .from('employees')
      .insert([dbPayload])
      .select()
      .single()

    if (error) {
      alert("Error saving: " + error.message)
      return
    }

    if (data) {
      const uiCarrier: KnowledgeCarrier = {
        id: data.id,
        name: data.name,
        role: data.role,
        email: data.email,
        department: data.department,
        slackId: data.slack_id,
        isHandoverInitiated: data.is_handover_initiated,
        isLocked: data.is_locked || false
      }
      setCarriers([uiCarrier, ...carriers])
    }

    setNewCarrier({ name: "", role: "", email: "", department: "", slackId: "" })
    setIsFormOpen(false)
  }

  // 🚀 REAL DATA: Delete from Supabase Database
  const handleDeleteCarrier = async (id: string) => {
    if (!confirm("Are you sure you want to remove this Knowledge Carrier?")) return;

    const { error } = await supabase.from('employees').delete().eq('id', id)

    if (error) {
      alert("Error deleting: " + error.message)
    } else {
      setCarriers(carriers.filter(c => c.id !== id))
    }
  }

  // 🚀 REAL DATA: Initiate Continuity Handover
  const handleInitiateHandover = async (carrier: KnowledgeCarrier) => {
    if (!confirm(`Start Continuity Handover for ${carrier.name}?\n\nThis will securely log the process and notify them via Slack.`)) {
      return;
    }

    setLoadingActionId(carrier.id);

    try {
      const response = await fetch('/api/handover/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeName: carrier.name,
          slackUserId: carrier.slackId || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        await supabase.from('employees').update({ is_handover_initiated: true }).eq('id', carrier.id);

        setCarriers(prev => prev.map(c =>
          c.id === carrier.id ? { ...c, isHandoverInitiated: true } : c
        ));
        alert(`✅ Success! Continuity Handover initiated for ${carrier.name}.`);
      } else {
        alert(`❌ Error: ${data.error || 'Failed to initiate handover'}`);
      }
    } catch (error) {
      console.error("Handover trigger failed:", error);
      alert("❌ Network error. Please try again.");
    } finally {
      setLoadingActionId(null);
    }
  }

  // 🔒 STEP 5: Lock the Vault Permanently
  const handleLockVault = async (carrier: KnowledgeCarrier) => {
    if (!confirm(`🔒 LOCK VAULT for ${carrier.name}?\n\nThis will permanently archive their Knowledge Vault, Brain Map, and Q&A. It cannot be edited further.`)) {
      return;
    }

    setLoadingActionId(carrier.id);

    const { error } = await supabase
      .from('employees')
      .update({ is_locked: true })
      .eq('id', carrier.id);

    if (!error) {
      setCarriers(prev => prev.map(c =>
        c.id === carrier.id ? { ...c, isLocked: true } : c
      ));
      alert(`🔒 Vault Locked Successfully for ${carrier.name}. Their legacy is secure forever.`);
    } else {
      alert("Error locking vault: " + error.message);
    }
    setLoadingActionId(null);
  }

  const filteredCarriers = carriers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* 🏆 MANIFESTO HEADER */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        People · Knowledge Carriers
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Knowledge Carriers
      </h1>
      <p className="text-muted max-w-xl mb-12">
        Your team, their roles, and the continuity handovers in progress.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search by name, role, or department..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border hairline bg-white/50 focus:outline-none focus:border-brown text-brown placeholder:text-muted transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-6 py-3 bg-brown text-cream-deep rounded-2xl hover:bg-brown/90 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Knowledge Carrier
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-brown italic">New Knowledge Carrier</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-brown">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">FULL NAME *</label>
              <input type="text" name="name" value={newCarrier.name} onChange={handleInputChange} placeholder="e.g. John Doe" className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">EMAIL ADDRESS *</label>
              <input type="email" name="email" value={newCarrier.email} onChange={handleInputChange} placeholder="e.g. john@company.com" className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">ROLE / JOB TITLE</label>
              <input type="text" name="role" value={newCarrier.role} onChange={handleInputChange} placeholder="e.g. Software Engineer" className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown" />
            </div>
            <div>
              <label className="block text-xs font-mono text-muted mb-2">DEPARTMENT</label>
              <input type="text" name="department" value={newCarrier.department} onChange={handleInputChange} placeholder="e.g. Engineering" className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-muted mb-2">SLACK MEMBER ID (Optional, for Auto-DM)</label>
              <input type="text" name="slackId" value={newCarrier.slackId} onChange={handleInputChange} placeholder="e.g. U01234ABC" className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-sm font-mono text-muted hover:text-brown transition-colors">Cancel</button>
            <button onClick={handleSaveCarrier} className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold">
              <Save className="w-4 h-4" /> Save Carrier
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-center text-muted font-mono py-10">Loading continuity network...</p>
        ) : filteredCarriers.length > 0 ? (
          filteredCarriers.map((carrier) => (
            <div key={carrier.id} className="rounded-2xl border hairline bg-cream-deep/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brown/50 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brown/10 flex items-center justify-center text-brown font-display text-xl italic group-hover:bg-brown group-hover:text-cream-deep transition-colors">
                  {carrier.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-display text-xl text-brown italic">{carrier.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Briefcase className="w-3 h-3 text-muted" />
                    <span className="text-sm text-muted font-mono">{carrier.role || "No Role"} · {carrier.department || "No Department"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted" />
                  <span className="text-sm text-brown font-mono">{carrier.email}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* 🚀 STEP 5: Vault Locking Logic */}
                  {carrier.isHandoverInitiated ? (
                    carrier.isLocked ? (
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 border border-gray-200">
                        <Lock className="w-3.5 h-3.5" /> Vault Locked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLockVault(carrier)}
                        disabled={loadingActionId === carrier.id}
                        className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 border border-red-200 disabled:opacity-50"
                        title="Permanently lock this employee's knowledge vault"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {loadingActionId === carrier.id ? "Locking..." : "Lock Vault"}
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleInitiateHandover(carrier)}
                      disabled={loadingActionId === carrier.id}
                      className="px-3 py-1.5 bg-gold/20 text-brown hover:bg-gold/30 rounded-lg text-xs font-mono font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-50 border border-gold/30"
                    >
                      <Brain className="w-3.5 h-3.5" />
                      {loadingActionId === carrier.id ? "Initiating..." : "Start Continuity"}
                    </button>
                  )}

                  <button onClick={() => handleDeleteCarrier(carrier.id)} className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Remove Carrier">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-brown font-display text-xl italic mb-2">
              {searchQuery ? "No carriers match your search." : "Your continuity network is empty."}
            </p>
            <p className="text-sm text-muted">
              {searchQuery ? "Try adjusting your search query." : "Click 'Add Knowledge Carrier' to get started."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}