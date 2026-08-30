"use client"

import { useState } from "react"
import { BookOpen, Plus, Search, Trash2, Tag, X, Save, FileText } from "lucide-react"

// Define the structure of a Knowledge Article
interface KnowledgeItem {
  id: string
  title: string
  tags: string[]  // Ab fixed category ki jagah multiple tags!
  summary: string
  createdAt: string
}

export default function KnowledgePage() {
  // Start completely empty. No fake data!
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // State to control the "Add Article" form
  const [isFormOpen, setIsFormOpen] = useState(false)

  // State to hold the new article's details
  const [newItem, setNewItem] = useState({
    title: "",
    tags: [] as string[],
    summary: ""
  })
  const [newTagInput, setNewTagInput] = useState("")

  // Handle input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewItem(prev => ({ ...prev, [name]: value }))
  }

  // Add a tag when user presses Enter or comma
  const handleAddTag = () => {
    const tag = newTagInput.trim().toLowerCase()
    if (tag && !newItem.tags.includes(tag)) {
      setNewItem(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setNewTagInput("")
    }
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setNewItem(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }))
  }

  // Save the new article to the list
  const handleSaveItem = () => {
    if (!newItem.title || !newItem.summary) {
      alert("Title and Summary are required!")
      return
    }

    const item: KnowledgeItem = {
      id: Date.now().toString(),
      ...newItem,
      createdAt: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    }

    setItems([...items, item])

    // Reset form and close it
    setNewItem({ title: "", tags: [], summary: "" })
    setNewTagInput("")
    setIsFormOpen(false)
  }

  // Delete an article from the list
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  // Filter articles based on search query
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      {/* Header */}
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-muted mb-4">
        Workspace · Knowledge
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-brown italic mb-4">
        Knowledge
      </h1>
      <p className="text-muted max-w-xl mb-12">
        The organized knowledge base VEQ builds from your team's work — decisions, context, and reasoning.
      </p>

      {/* Action Bar: Search + Add Button */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search knowledge base..."
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
          Add Article
        </button>
      </div>

      {/* Add Article Form (Shows only when isFormOpen is true) */}
      {isFormOpen && (
        <div className="rounded-2xl border hairline bg-cream-deep/40 p-6 mb-8 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl text-brown italic">New Knowledge Entry</h2>
            <button onClick={() => setIsFormOpen(false)} className="text-muted hover:text-brown">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-mono text-muted mb-2">TITLE *</label>
              <input
                type="text"
                name="title"
                value={newItem.title}
                onChange={handleInputChange}
                placeholder="e.g. Q3 Pricing Strategy Decision"
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">TAGS (Press Enter or Comma to add)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="e.g. hr-policy, onboarding, engineering (press Enter)"
                  className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown"
                />
                {newItem.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {newItem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brown/10 text-brown rounded-full text-sm font-mono"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted mb-2">SUMMARY / CONTENT *</label>
              <textarea
                name="summary"
                value={newItem.summary}
                onChange={handleInputChange}
                placeholder="Write down the key details, context, or reasoning here..."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border hairline bg-white focus:outline-none focus:border-brown text-brown resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsFormOpen(false)}
              className="px-6 py-2 text-sm font-mono text-muted hover:text-brown transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveItem}
              className="px-6 py-2 bg-brown text-cream-deep rounded-xl hover:bg-brown/90 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </button>
          </div>
        </div>
      )}

      {/* Knowledge List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border hairline bg-cream-deep/40 p-6 hover:border-brown/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3 flex-wrap">
                  {item.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-brown/10 text-brown rounded-full text-xs font-mono flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                  <span className="text-xs text-muted font-mono">{item.createdAt}</span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="font-display text-xl text-brown italic mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-brown/80 leading-relaxed whitespace-pre-wrap">
                {item.summary}
              </p>
            </div>
          ))
        ) : (
          /* Empty State */
          <div className="rounded-2xl border hairline border-dashed border-cream-deep p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-brown font-display text-xl italic mb-2">
              {searchQuery ? "No articles match your search." : "Your knowledge base is empty."}
            </p>
            <p className="text-sm text-muted">
              {searchQuery ? "Try adjusting your search query." : "Add your first article with custom tags to get started."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}