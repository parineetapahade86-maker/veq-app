import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const supabase = getSupabase();
        if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // Fetch decisions that are still pending outcome review
        // We can add a date filter later (e.g., created_at < 30 days ago), 
        // but for now, let's show all pending ones to test the loop.
        const { data, error } = await supabase
            .from('company_memories')
            .select('id, topic, content, created_at, memory_type')
            .eq('company_id', companyId)
            .eq('outcome_status', 'pending')
            .in('memory_type', ['decision', 'lesson_learned'])
            .order('created_at', { ascending: false })
            .limit(5); // Show top 5 pending reviews

        if (error) throw error;

        return NextResponse.json({ success: true, data: data || [] });

    } catch (error) {
        console.error('Pending Outcomes Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch pending outcomes' }, { status: 500 });
    }
}