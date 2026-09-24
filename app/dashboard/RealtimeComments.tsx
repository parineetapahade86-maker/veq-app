'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Send, Trash2 } from 'lucide-react';

interface Comment {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
}

export default function RealtimeComments({ knowledgeItemId }: { knowledgeItemId: string }) {
    const { user } = useUser();
    const supabase = createClient();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!knowledgeItemId) return;

        const fetchComments = async () => {
            const { data, error } = await supabase
                .from('comments')
                .select('*')
                .eq('knowledge_item_id', knowledgeItemId)
                .order('created_at', { ascending: true });

            if (data) setComments(data);
            setLoading(false);
        };

        fetchComments();

        // REALTIME MAGIC: Jab bhi naya comment aaye, bina refresh kiye update hoga!
        const channel = supabase
            .channel(`comments-${knowledgeItemId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'comments',
                    filter: `knowledge_item_id=eq.${knowledgeItemId}`,
                },
                (payload) => {
                    setComments((current) => [...current, payload.new as Comment]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [knowledgeItemId]);

    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        const { error } = await supabase.from('comments').insert({
            knowledge_item_id: knowledgeItemId,
            user_id: user.id,
            content: newComment,
        });

        if (!error) {
            setNewComment(''); // Input clear kar do
        }
    };

    if (loading) return <p className="text-gray-500 text-sm">Loading discussions...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
                <MessageCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Team Discussions</h3>
                <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {comments.length} comments
                </span>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-6 max-h-[400px] pr-2">
                {comments.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">No discussions yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shrink-0">
                                {comment.user_id.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wide">
                                    {new Date(comment.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendComment} className="flex gap-2 mt-auto">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
                <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}