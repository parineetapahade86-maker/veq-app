"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@clerk/nextjs"
import { MessageSquare, Send, Loader2 } from "lucide-react"

interface CommentsSectionProps {
    articleId: string
    articleTitle: string
}

export default function CommentsSection({ articleId, articleTitle }: CommentsSectionProps) {
    const { user } = useUser()
    const supabase = createClient()
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (user) fetchComments()
    }, [user, articleId])

    const fetchComments = async () => {
        try {
            const { data } = await supabase
                .from("article_comments")
                .select("*")
                .eq("article_id", articleId)
                .order("created_at", { ascending: false })

            if (data) setComments(data)
        } catch (error) {
            console.error("Error fetching comments:", error)
        } finally {
            setLoading(false)
        }
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !user) return

        setSubmitting(true)
        try {
            const { data: profile } = await supabase
                .from("user_profiles")
                .select("company_id")
                .eq("clerk_id", user.id)
                .single()

            // 1. Insert Comment
            const { error: commentError } = await supabase
                .from("article_comments")
                .insert({
                    article_id: articleId,
                    user_id: user.id,
                    user_name: user.fullName || user.primaryEmailAddress?.emailAddress || "Anonymous",
                    content: newComment.trim()
                })

            // 2. Log Activity
            if (!commentError && profile?.company_id) {
                await supabase
                    .from("activity_logs")
                    .insert({
                        company_id: profile.company_id,
                        user_id: user.id,
                        user_name: user.fullName || "Anonymous",
                        action: "commented on",
                        target_title: articleTitle
                    })
            }

            setNewComment("")
            fetchComments() // Refresh list
        } catch (error) {
            console.error("Error posting comment:", error)
        } finally {
            setSubmitting(false)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <div className="rounded-2xl border border-[#E9DED0] bg-white p-6 shadow-sm mt-8">
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-[#C6A15B]" />
                <h3 className="font-display text-xl text-[#3A2418] italic">Team Discussion ({comments.length})</h3>
            </div>

            {/* Comment Form */}
            <form onSubmit={handlePostComment} className="mb-8">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts, suggest edits, or ask a question..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E9DED0] bg-[#F4EDE1]/30 focus:outline-none focus:border-[#C6A15B] focus:ring-2 focus:ring-[#C6A15B]/20 text-[#3A2418] resize-none h-24"
                />
                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={submitting || !newComment.trim()}
                        className="px-5 py-2 bg-[#3A2418] text-[#F4EDE1] rounded-lg hover:bg-[#4A2F20] transition-colors text-sm font-mono font-semibold disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Post Comment
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {loading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-[#C6A15B]" /></div>
            ) : comments.length === 0 ? (
                <p className="text-sm text-[#806B58] text-center py-4 bg-[#F4EDE1]/30 rounded-xl">No comments yet. Be the first to discuss!</p>
            ) : (
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment.id} className="p-4 rounded-xl bg-[#F4EDE1]/30 border border-[#E9DED0]">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-semibold text-sm text-[#3A2418]">{comment.user_name}</p>
                                <p className="text-xs text-[#806B58] font-mono">{formatTime(comment.created_at)}</p>
                            </div>
                            <p className="text-sm text-[#3A2418]/90 leading-relaxed">{comment.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}