'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useUser } from '@clerk/nextjs';
import { MessageCircle, Send } from 'lucide-react';

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

    // 1. Fetch old comments
    useEffect(() => {
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

        // 2. REALTIME SUBSCRIPTION (Ye magic hai!)
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

    // 3. Send Comment Function
    const handleSendComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        // Check for @mentions
        const hasMention = newComment.includes('@');

        const { error } = await supabase.from('comments').insert({
            knowledge_item_id: knowledgeItemId,
            user_id: user.id,
            content: newComment,
            is_mention: hasMention,
        });

        if (!error) {
            setNewComment('');
        }
    };

    if (loading) return <p>Loading discussions...</p>;

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-6">
            <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Team Discussions</h3>
            </div>

            {/* Comments List */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No discussions yet. Start the conversation!</p>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                                {comment.user_id.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 bg-gray-50 p-3 rounded-lg">
                                <p className="text-sm text-gray-800">{comment.content}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {new Date(comment.created_at).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendComment} className="flex gap-2">
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment... (Use @ to mention)"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                    type="submit"
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}