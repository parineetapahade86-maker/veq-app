import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).single();
        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // 1. Fetch pending tasks from departed/offboarding employees
        const { data: tasks } = await supabase
            .from('veq_agent_tasks')
            .select('*')
            .eq('company_id', companyId)
            .eq('handover_status', 'pending')
            .order('created_at', { ascending: false });

        // 2. Fetch pending dependencies/lessons learned from departed employees
        // (We look for memories with outcome_status = 'pending' that are linked to offboarding people)
        const { data: memories } = await supabase
            .from('company_memories')
            .select('*')
            .eq('company_id', companyId)
            .in('memory_type', ['lesson_learned', 'decision'])
            .eq('outcome_status', 'pending')
            .order('created_at', { ascending: false });

        // Extract predecessor name from the first task for the UI header
        const predecessor = tasks && tasks.length > 0 ? tasks[0].ghost_name : null;

        return NextResponse.json({
            success: true,
            data: {
                predecessor,
                tasks: tasks || [],
                memories: memories || []
            }
        });

    } catch (error) {
        console.error('Pending Handover Fetch Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch handover data' }, { status: 500 });
    }
}