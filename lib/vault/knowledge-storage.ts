// lib/vault/knowledge-storage.ts
import { supabase } from '@/lib/supabase/client';

export interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    keyPoints: string[];
    source: string;
    sourceUrl?: string;
    authorId?: string;
    confidence?: number;
    status: 'pending_review' | 'approved' | 'archived';
    created_at: string;
}

/**
 * Save captured knowledge to REAL Supabase Database
 */
export async function saveToVault(
    knowledge: {
        category: string;
        summary: string;
        keyPoints: string[];
        isValuable: boolean;
    },
    originalMessage?: {
        channelId?: string;
        timestamp?: string;
        userId?: string;
    }
): Promise<KnowledgeEntry | null> {

    try {
        // Build source URL
        let sourceUrl: string | undefined;
        if (originalMessage?.channelId && originalMessage?.timestamp) {
            sourceUrl = `https://slack.com/archives/${originalMessage.channelId}/p${originalMessage.timestamp.replace('.', '')}`;
        }

        const entryData = {
            title: knowledge.summary.substring(0, 50) + (knowledge.summary.length > 50 ? '...' : ''),
            content: knowledge.summary,
            category: knowledge.category || 'General',
            key_points: knowledge.keyPoints || [], // JSONB format
            source: 'slack',
            source_url: sourceUrl,
            author_id: originalMessage?.userId,
            confidence: 0.85,
            status: 'pending_review',
        };

        // 1. Insert into REAL Supabase Database
        const { data, error } = await supabase
            .from('knowledge')
            .insert([entryData])
            .select()
            .single();

        if (error) {
            console.error('❌ [Supabase Error] Failed to save knowledge:', error);
            return null;
        }

        console.log('💾 [VEQ Vault] Knowledge permanently saved to DB:', data.id);
        return data as KnowledgeEntry;

    } catch (error) {
        console.error('❌ [VEQ Vault] Unexpected error:', error);
        return null;
    }
}

/**
 * Get all knowledge entries from Database
 */
export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
    const { data, error } = await supabase
        .from('knowledge')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching knowledge:', error);
        return [];
    }
    return data || [];
}