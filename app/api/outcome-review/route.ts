import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
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

        const { memoryId, outcomeStatus, outcomeNotes } = await req.json();

        if (!memoryId || !outcomeStatus) {
            return NextResponse.json({ error: 'memoryId and outcomeStatus are required' }, { status: 400 });
        }

        // Update the memory with the REAL, human-verified outcome
        const { data, error } = await supabase
            .from('company_memories')
            .update({
                outcome_status: outcomeStatus,
                outcome_notes: outcomeNotes || null,
                outcome_reviewed_at: new Date().toISOString(),
                outcome_reviewed_by: user.id
            })
            .eq('id', memoryId)
            .eq('company_id', companyId) // Security: Ensure it belongs to this company
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: 'Outcome logged successfully. VEQ will use this to improve future recommendations.',
            data
        });

    } catch (error) {
        console.error('Outcome Review Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to log outcome' }, { status: 500 });
    }
}