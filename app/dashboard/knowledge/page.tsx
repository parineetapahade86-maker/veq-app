"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import { BookOpen, Plus, Search, Trash2, Tag, X, Save, FileText, Upload, Loader2, AlertCircle, Filter, Calendar } from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ---------- Types ----------
interface Entity {
  id: string
  entity_type: string
  entity_value: string
}

interface KnowledgeItem {
  id: string
  source_reference: string
  content: string
  source_type: string
  created_at: string
  metadata: any
  entities?: Entity[]
}

// ---------- Knowledge Card Component ----------
function KnowledgeCard({ item, onDelete }: { item: KnowledgeItem; onDelete: (id: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [relatedItems, setRelatedItems] = useState<any[]>([])
  const [loadingRelated, setLoadingRelated] = useState(false)
  const [showRelated, setShowRelated] = useState(false)

  const displayContent = isExpanded ? item.content : item.content.substring(0, 500)
  const isLong = item.content.length > 500

  // 🧠 Fetch related knowledge when card is expanded
  useEffect(() => {
    if (isExpanded && relatedItems.length === 0) {
      fetchRelatedKnowledge()
    }
  }, [isExpanded])

  const fetchRelatedKnowledge = async () => {
    setLoadingRelated(true)
    try {
      const res = await fetch(`/api/knowledge/${item.id}/related`)
      const data = await res.json()
      if (data.success) {
        setRelatedItems(data.related || [])
      }
    } catch (err) {
      console.error('Failed to fetch related:', err)
    } finally {
      setLoadingRelated(false)
    }
  }

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'person': return '👥'
      case 'organization': return '🏢'
      case 'topic': return '📌'
      case 'date': return '📅'
      case 'action_item': return '🎯'
      default: return '📎'
    }
  }

  const getEntityColor = (type: string) => {
    switch (type) {
      case 'person': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'organization': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'topic': return 'bg-green-100 text-green-800 border-green-200'
      case 'date': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'action_item': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/60 p-6 hover:border-[#C6A15B]/50 transition-all group shadow-sm">
      {/* Header: type badge, date, and delete button */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-mono flex items-center gap-1 ${item.source_type === "document" ? "bg-[#3A2418]/10 text-[#3A2418]" : "bg-[#C6A15B]/20 text-[#3A2418]"}`}>
            <FileText className="w-3 h-3" /> {item.source_type === "document" ? "Document" : "Manual Entry"}
          </span>
          <span className="text-xs text-[#806B58] font-mono flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <button
          onClick={() => onDelete(item.id)}
          className="p-2 text-[#806B58] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <h3 className="font-display text-xl text-[#3A2418] italic mb-2">
        {item.source_reference || "Untitled Entry"}
      </h3>

      <div className="text-sm text-[#3A2418]/80 leading-relaxed whitespace-pre-wrap mb-3">
        {displayContent}
        {isLong && !isExpanded && <span>...</span>}
      </div>

      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mb-4 text-[#C6A15B] hover:text-[#3A2418] font-mono text-sm font-semibold transition-colors flex items-center gap-1"
        >
          {isExpanded ? '📖 Show Less' : '📖 Read Full Document'}
        </button>
      )}

      {/* 🧠 AI-EXTRACTED ENTITIES */}
      {item.entities && item.entities.length > 0 && (
        <div className="pt-4 border-t border-[#E9DED0]">
          <div className="flex flex-wrap gap-2">
            {item.entities.map((entity) => (
              <span
                key={entity.id}
                className={`px-2 py-1 rounded-lg text-xs font-mono border ${getEntityColor(entity.entity_type)}`}
              >
                {getEntityIcon(entity.entity_type)} {entity.entity_value}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 🔗 RELATED KNOWLEDGE SECTION (Shows only when expanded) */}
      {isExpanded && (
        <div className="mt-6 pt-6 border-t border-[#E9DED0]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-display text-lg text-[#3A2418] italic flex items-center gap-2">
              🔗 Related Knowledge
            </h4>
            <button
              onClick={() => setShowRelated(!showRelated)}
              className="text-xs font-mono text-[#C6A15B] hover:text-[#3A2418] transition-colors"
            >
              {showRelated ? 'Hide' : 'Show'} ({relatedItems.length})
            </button>
          </div>

          {loadingRelated ? (
            <div className="flex items-center gap-2 text-[#806B58] text-sm py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              AI is finding connections...
            </div>
          ) : relatedItems.length > 0 ? (
            <div className="space-y-3">
              {(showRelated ? relatedItems : relatedItems.slice(0, 3)).map((related: any) => (
                <div
                  key={related.id}
                  className="p-3 rounded-xl bg-white/60 border border-[#E9DED0] hover:border-[#C6A15B]/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-display text-[#3A2418] italic text-sm mb-1">
                        {related.source_reference}
                      </p>
                      <p className="text-xs text-[#806B58] line-clamp-2">
                        {related.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#806B58]">
                        <span className="font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(related.created_at).toLocaleDateString()}
                        </span>
                        <span className="px-2 py-0.5 bg-[#C6A15B]/20 text-[#3A2418] rounded-full text-xs font-mono font-semibold">
                          {(related.similarity * 100).toFixed(0)}% match
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#806B58] italic py-2">No related knowledge found yet.</p>
          )}
        </div>
      )}
    </div>
  )
}

// ---------- Main Page ----------
export default function KnowledgePage() {
  const { user } = useUser()
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [companyId, setCompanyId] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const [filterType, setFilterType] = useState("all")
  const [filterYear, setFilterYear] = useState("all")

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newItem, setNewItem] = useState({ title: "", tags: [] as string[], content: "" })
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (user) {
      fetchCompanyIdAndItems()
    }
  }, [user])

  const fetchCompanyIdAndItems = async () => {
    setLoading(true)
    try {
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single()

      if (profile?.company_id) {
        setCompanyId(profile.company_id)
        const res = await fetch('/api/upload-knowledge')
        const result = await res.json()
        if (result.success && result.data) {
          setItems(result.data)
        }
      }
    } catch (err) {
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !companyId) return
    setIsUploading(true)
    setMessage("🧠 AI is reading your document...")
    setError("")
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload-knowledge", { method: "POST", body: formData })
      const data = await res.json()
      if (res.ok && data.success) {
        setMessage(`✅ Document added! AI extracted ${data.entitiesCount || 0} entities.`)
        fetchCompanyIdAndItems()
      } else {
        setError("❌ " + (data.error || "Upload failed"))
      }
    } catch (err) {
      setError("❌ Network error")
    } finally {
      setIsUploading(false)
      e.target.value = ""
      setTimeout(() => { setMessage(""); setError("") }, 4000)
    }
  }

  const handleAddAnotherFile = () => {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    if (input) input.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !newItem.tags.includes(tag)) {
      setNewItem((prev) => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); handleAddTag() }
  }

  const handleRemoveTag = (tag: string) => {
    setNewItem((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))
  }

  const handleSaveItem = async () => {
    if (!newItem.title || !newItem.content || !companyId) {
      setError("Title and Content are required!")
      return
    }
    setIsSaving(true)
    setError("")
    try {
      const res = await fetch("/api/upload-knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newItem.content,
          companyId: companyId,
          sourceType: "manual",
          sourceReference: newItem.title,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setNewItem({ title: "", tags: [], content: "" })
        setTagInput("")
        setIsFormOpen(false)
        setMessage(`✅ Entry saved! AI extracted ${data.entitiesCount || 0} entities.`)
        fetchCompanyIdAndItems()
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError("❌ " + (data.error || "Failed to save"))
      }
    } catch (err) {
      setError("❌ Network error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this entry?")) return
    try {
      const { error } = await supabase.from("employee_knowledge").delete().eq("id", id)
      if (!error) {
        setItems((prev) => prev.filter((item) => item.id !== id))
        setMessage("🗑️ Deleted")
        setTimeout(() => setMessage(""), 3000)
      } else {
        setError("❌ Failed to delete")
      }
    } catch (err) {
      setError("❌ Failed to delete")
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = searchQuery === "" ||
        item.source_reference?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.entities?.some(e => e.entity_value.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesType = filterType === "all" || item.source_type === filterType
      const itemYear = new Date(item.created_at).getFullYear().toString()
      const matchesYear = filterYear === "all" || itemYear === filterYear
      return matchesSearch && matchesType && matchesYear
    })
  }, [items, searchQuery, filterType, filterYear])

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const year = new Date(item.created_at).getFullYear()
      if (!acc[year]) acc[year] = []
      acc[year].push(item)
      return acc
    }, {} as Record<number, KnowledgeItem[]>)
  }, [filteredItems])

  const availableYears = useMemo(() => {
    const years = new Set(items.map(item => new Date(item.created_at).getFullYear().toString()))
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [items])

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
        Workspace · Knowledge Vault
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
        Knowledge Vault
      </h1>
      <p className="text-[#806B58] max-w-xl mb-8">
        The organized knowledge base VEQ builds from your team&apos;s work, documents, and decisions.
      </p>

      {message && (
        <div className="mb-6 p-4 rounded-xl border border-[#C6A15B]/30 bg-[#C6A15B]/10 text-[#3A2418]">
          <p className="font-medium flex items-center gap-2">
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />} {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700">
          <p className="font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#806B58]" />
          <input
            type="text"
            placeholder="Search knowledge, entities, topics..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9DED0] bg-white/50 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <label className="px-6 py-3 bg-[#3A2418] text-[#F4EDE1] rounded-2xl hover:bg-[#4A2F20] transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold cursor-pointer">
          <Upload className="w-4 h-4" /> {isUploading ? "Processing..." : "Upload File"}
          <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
        </label>
        <button onClick={handleAddAnotherFile} className="px-6 py-3 border border-[#C6A15B] text-[#C6A15B] rounded-2xl hover:bg-[#C6A15B]/10 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add
        </button>
        <button onClick={() => setIsFormOpen(true)} className="px-6 py-3 border border-[#3A2418] text-[#3A2418] rounded-2xl hover:bg-[#3A2418]/5 transition-colors flex items-center justify-center gap-2 font-mono text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add manual entry
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10 p-4 rounded-2xl bg-[#F4EDE1]/40 border border-[#E9DED0]">
        <div className="flex items-center gap-2 text-[#806B58] font-mono text-xs uppercase">
          <Filter className="w-4 h-4" /> Filters:
        </div>
        <div className="flex bg-white/50 rounded-xl p-1 border border-[#E9DED0]">
          {['all', 'document', 'manual'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-1.5 rounded-lg text-sm font-mono transition-all ${filterType === type ? 'bg-[#3A2418] text-[#F4EDE1] shadow-sm' : 'text-[#806B58] hover:text-[#3A2418]'}`}
            >
              {type === 'all' ? 'All Types' : type === 'document' ? 'Documents' : 'Manual'}
            </button>
          ))}
        </div>
        <select
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="px-4 py-2 rounded-xl border border-[#E9DED0] bg-white/50 text-[#3A2418] font-mono text-sm focus:outline-none focus:border-[#C6A15B]"
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
        <span className="ml-auto text-xs font-mono text-[#806B58]">
          Showing {filteredItems.length} of {items.length} items
        </span>
      </div>

      {isFormOpen && (
        <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-[#3A2418] italic">New knowledge entry</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-[#806B58] hover:text-[#3A2418]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-[#806B58] mb-2">TITLE *</label>
              <input type="text" name="title" value={newItem.title} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]" />
            </div>
            <div>
              <label className="block text-xs font-mono text-[#806B58] mb-2">TAGS (press Enter)</label>
              <div className="space-y-2">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]" />
                {newItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newItem.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-[#C6A15B]/20 text-[#3A2418] rounded-full text-sm font-mono">
                        <Tag className="w-3 h-3" />{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-600 ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-xs font-mono text-[#806B58] mb-2">CONTENT *</label>
              <textarea name="content" value={newItem.content} onChange={handleInputChange} rows={5} className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418]">Cancel</button>
            <button onClick={handleSaveItem} disabled={isSaving} className="px-6 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] disabled:opacity-50 flex items-center gap-2 font-mono text-sm font-semibold">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {isSaving ? "Saving..." : "Save entry"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-12">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#806B58]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading your knowledge vault...
          </div>
        ) : Object.keys(groupedItems).length > 0 ? (
          Object.keys(groupedItems).sort((a, b) => Number(b) - Number(a)).map((year) => (
            <div key={year}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-display text-3xl text-[#3A2418] italic">{year}</h2>
                <div className="flex-1 h-px bg-[#E9DED0]"></div>
                <span className="text-xs font-mono text-[#806B58] bg-[#C6A15B]/20 px-3 py-1 rounded-full">
                  {groupedItems[Number(year)].length} items
                </span>
              </div>
              <div className="space-y-4">
                {groupedItems[Number(year)].map((item) => (
                  <KnowledgeCard key={item.id} item={item} onDelete={handleDeleteItem} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center">
            <BookOpen className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
            <p className="text-[#3A2418] font-display text-xl italic mb-2">No knowledge found.</p>
            <p className="text-sm text-[#806B58]">Try adjusting your filters or upload a new document.</p>
          </div>
        )}
      </div>
    </section>
  )
}