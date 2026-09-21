import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).single();
        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // Fetch decisions that HAVE been reviewed
        const { data, error } = await supabase
            .from('company_memories')
            .select('id, topic, content, created_at, outcome_status, outcome_notes, outcome_reviewed_at')
            .eq('company_id', companyId)
            .neq('outcome_status', 'pending') // Only get positive, negative, or neutral
            .in('memory_type', ['decision', 'lesson_learned'])
            .order('outcome_reviewed_at', { ascending: false })
            .limit(20);

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });

    } catch (error) {
        console.error('Completed Outcomes Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch completed outcomes' }, { status: 500 });
    }
}