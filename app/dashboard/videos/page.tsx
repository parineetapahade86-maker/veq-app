"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { createClient } from "@supabase/supabase-js"
import {
  Video, Upload, Plus, Search, Trash2, Play, Loader2,
  AlertCircle, X, Pencil
} from "lucide-react"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface VideoItem {
  id: string
  title: string
  url: string
  thumbnail_url?: string
  duration?: number
  created_at: string
  metadata?: any
  storage_path?: string
}

export default function VideosPage() {
  const { user } = useUser()
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)

  // ✏️ NEW: Edit State
  const [editingVideo, setEditingVideo] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")

  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    description: ""
  })

  useEffect(() => {
    if (user) {
      fetchVideos()
    }
  }, [user])

  const fetchVideos = async () => {
    setLoading(true)
    setError("")
    try {
      if (!user?.id) return

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single()

      if (!profile?.company_id) {
        throw new Error("Company not found")
      }

      const { data, error: fetchError } = await supabase
        .from("videos")
        .select("*")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      setVideos(data || [])
    } catch (err: any) {
      console.error("Error fetching videos:", err)
      setError(err.message || "Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  // ✏️ NEW: Edit Functions
  const handleEditClick = (video: VideoItem) => {
    setEditingVideo(video.id)
    setEditTitle(video.title)
  }

  const handleSaveEdit = async (videoId: string) => {
    if (!editTitle.trim()) {
      setError("Title cannot be empty")
      return
    }

    try {
      const { error } = await supabase
        .from("videos")
        .update({ title: editTitle })
        .eq("id", videoId)

      if (error) throw error

      setMessage("✅ Video title updated successfully!")
      setEditingVideo(null)
      setEditTitle("")
      await fetchVideos()
      setTimeout(() => setMessage(""), 3000)
    } catch (err: any) {
      console.error("Edit Error:", err)
      setError("Failed to update video title")
    }
  }

  const handleCancelEdit = () => {
    setEditingVideo(null)
    setEditTitle("")
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024 * 1024) { // Increased to 500MB for API route compatibility
      setError("File size must be less than 500MB")
      return
    }

    if (!file.type.startsWith('video/')) {
      setError("Please upload a valid video file")
      return
    }

    setUploading(true)
    setError("")
    setMessage("🎬 Step 1: Preparing upload...")

    try {
      if (!user?.id) {
        throw new Error("User not authenticated")
      }

      console.log("🔍 Step 2: Fetching user profile...")
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("❌ Profile Error:", profileError)
        throw new Error(`Profile error: ${profileError.message}`)
      }

      if (!profileData || !profileData.company_id) {
        throw new Error("Company profile not found. Please set up your company first.")
      }

      const companyId = profileData.company_id
      const userId = user.id
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `${companyId}/${fileName}`

      console.log("📤 Step 3: Uploading to Supabase Storage at path:", filePath)
      setMessage("🎬 Step 3: Uploading file to storage...")

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error("❌ Storage Upload Error Full Object:", uploadError)
        console.error("❌ Storage Upload Message:", uploadError.message)
        // ✅ FIX: Cast to any to prevent TS2339 error on 'details'
        console.error("❌ Storage Upload Details:", (uploadError as any)?.details)
        throw new Error(`Storage upload failed: ${uploadError.message || 'Check if "videos" bucket exists and is public'}`)
      }

      console.log("✅ Step 3 Success! Upload data:", uploadData)
      setMessage("🎬 Step 4: Getting public URL...")

      const { data: urlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath)

      const publicUrl = urlData?.publicUrl
      if (!publicUrl) {
        throw new Error("Failed to get public URL for the uploaded video.")
      }

      console.log("✅ Step 4 Success! Public URL:", publicUrl)
      setMessage("🎬 Step 5: Saving to database...")

      const { error: dbError } = await supabase
        .from("videos")
        .insert({
          employee_id: userId,
          company_id: companyId,
          title: file.name,
          url: publicUrl,
          storage_path: filePath,
          source_type: 'upload',
          metadata: {
            size: file.size,
            type: file.type,
            uploaded_by: user.emailAddresses?.[0]?.emailAddress || 'unknown'
          }
        })

      if (dbError) {
        console.error("❌ Database Insert Error Full Object:", dbError)
        console.error("❌ Database Insert Message:", dbError.message)
        // ✅ FIX: Cast to any to prevent TS2339 error on 'details'
        console.error("❌ Database Insert Details:", (dbError as any)?.details)
        throw new Error(`Database insert failed: ${dbError.message || 'Check RLS policies on videos table'}`)
      }

      console.log("✅ Step 5 Success! Video saved to database.")
      setMessage("✅ Video uploaded successfully!")
      await fetchVideos()

    } catch (err: any) {
      console.error("=== 🚨 FINAL CATCH BLOCK ERROR 🚨 ===")
      console.error("Error Object:", err)
      console.error("Error Message:", err?.message)

      setError(err?.message || "Failed to upload video. Press F12 and check Console for exact details.")
    } finally {
      setUploading(false)
      setTimeout(() => {
        setMessage("")
        setError("")
      }, 5000)
      if (e.target) e.target.value = ""
    }
  }

  const handleAddVideoUrl = async () => {
    if (!newVideo.title || !newVideo.url) {
      setError("Title and URL are required")
      return
    }

    setUploading(true)
    setError("")
    setMessage("Adding video URL...")

    try {
      if (!user?.id) throw new Error("User not authenticated")

      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("company_id")
        .eq("id", user.id)
        .single()

      if (profileError || !profileData?.company_id) {
        throw new Error("Company profile not found")
      }

      const { error } = await supabase
        .from("videos")
        .insert({
          employee_id: user.id,
          company_id: profileData.company_id,
          title: newVideo.title,
          url: newVideo.url,
          source_type: 'external_url',
          metadata: {
            description: newVideo.description,
            source: "external_url"
          }
        })

      if (error) throw error

      setMessage("✅ Video added successfully!")
      setNewVideo({ title: "", url: "", description: "" })
      setIsFormOpen(false)
      await fetchVideos()
      setTimeout(() => setMessage(""), 3000)
    } catch (err: any) {
      console.error("Add URL Error:", err)
      setError(err.message || "Failed to add video")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteVideo = async (id: string, storagePath?: string) => {
    if (!confirm("Delete this video?")) return

    try {
      if (storagePath) {
        await supabase.storage.from('videos').remove([storagePath])
      }

      const { error } = await supabase.from("videos").delete().eq("id", id)
      if (error) throw error

      setMessage("🗑️ Video deleted")
      await fetchVideos()
      setTimeout(() => setMessage(""), 3000)
    } catch (err: any) {
      console.error("Delete Error:", err)
      setError("Failed to delete video")
    }
  }

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
      <p className="font-mono text-xs tracking-[0.2em] uppercase text-[#806B58] mb-4">
        Workspace · Videos
      </p>
      <h1 className="font-display text-4xl md:text-5xl text-[#3A2418] italic mb-4">
        Videos
      </h1>
      <p className="text-[#806B58] max-w-xl mb-12">
        Your video library. Upload and organize your important recordings.
      </p>

      {message && (
        <div className="mb-6 p-4 rounded-xl border border-[#C6A15B]/30 bg-[#C6A15B]/10 text-[#3A2418]">
          <p className="font-medium flex items-center gap-2">
            {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-300 bg-red-50 text-red-700 flex items-center justify-between">
          <p className="font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {error}
          </p>
          <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <label className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-mono text-sm font-semibold cursor-pointer transition-all ${uploading ? "bg-[#E9DED0] text-[#806B58] cursor-not-allowed" : "bg-[#3A2418] text-[#F4EDE1] hover:bg-[#4A2F20]"
            }`}>
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload Video"}
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsFormOpen(true)}
            className="px-6 py-3 border border-[#C6A15B] text-[#C6A15B] rounded-2xl hover:bg-[#C6A15B]/10 transition-colors flex items-center gap-2 font-mono text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Video URL
          </button>
        </div>

        {isFormOpen && (
          <div className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg text-[#3A2418] italic">Add Video from URL</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-[#806B58] hover:text-[#3A2418]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#806B58] mb-2">TITLE *</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Q3 Product Demo"
                  className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#806B58] mb-2">VIDEO URL *</label>
                <input
                  type="url"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#806B58] mb-2">DESCRIPTION</label>
                <textarea
                  value={newVideo.description}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsFormOpen(false)} className="px-6 py-2 text-sm font-mono text-[#806B58] hover:text-[#3A2418]">
                  Cancel
                </button>
                <button
                  onClick={handleAddVideoUrl}
                  disabled={uploading || !newVideo.title || !newVideo.url}
                  className="px-6 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] disabled:opacity-50 flex items-center gap-2 font-mono text-sm font-semibold"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {uploading ? "Adding..." : "Add Video"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#806B58]" />
          <input
            type="text"
            placeholder="Search videos..."
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E9DED0] bg-white/50 focus:outline-none focus:border-[#C6A15B] text-[#3A2418]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-[#806B58]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading videos...
          </div>
        ) : filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="rounded-2xl border border-[#E9DED0] bg-[#F4EDE1]/40 overflow-hidden hover:border-[#C6A15B]/50 transition-all group"
              >
                <div className="aspect-video bg-[#E9DED0] relative flex items-center justify-center">
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="w-full h-full object-cover" />
                  ) : (
                    <Video className="w-12 h-12 text-[#806B58]" />
                  )}
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-12 h-12 text-white" />
                  </a>
                </div>

                {/* ✏️ UPDATED: Video Info with Edit Mode */}
                <div className="p-4">
                  {editingVideo === video.id ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E9DED0] bg-white focus:outline-none focus:border-[#C6A15B] text-[#3A2418] text-sm font-mono"
                        placeholder="Enter new title"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(video.id)}
                          className="flex-1 py-2 bg-[#C6A15B] text-white rounded-xl hover:bg-[#b08d4b] transition-colors flex items-center justify-center gap-2 text-sm font-mono font-semibold"
                        >
                          ✅ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 py-2 border border-[#E9DED0] text-[#806B58] rounded-xl hover:bg-[#E9DED0] transition-colors flex items-center justify-center gap-2 text-sm font-mono font-semibold"
                        >
                          ❌ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-display text-lg text-[#3A2418] italic mb-2 line-clamp-1" title={video.title}>
                        {video.title}
                      </h3>
                      <p className="text-xs text-[#806B58] font-mono mb-3">
                        {new Date(video.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(video)}
                          className="flex-1 py-2 border border-[#C6A15B] text-[#C6A15B] rounded-xl hover:bg-[#C6A15B]/10 transition-colors flex items-center justify-center gap-2 text-sm font-mono font-semibold"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video.id, video.storage_path)}
                          className="flex-1 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 text-sm font-mono font-semibold opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-[#E9DED0] p-12 text-center">
            <Video className="w-12 h-12 text-[#806B58] mx-auto mb-4" />
            <p className="text-[#3A2418] font-display text-xl italic mb-2">
              {searchQuery ? "No videos match your search." : "No videos uploaded yet."}
            </p>
            <p className="text-sm text-[#806B58]">
              {searchQuery ? "Try adjusting your search query." : "Upload your first video above."}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}