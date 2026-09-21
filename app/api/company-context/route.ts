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

        // 🔒 Securely get company ID
        const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', user.id).single();
        const companyId = profile?.company_id;
        if (!companyId) return NextResponse.json({ error: 'No company found' }, { status: 400 });

        // 1. Fetch Active SOPs (How the company works)
        const { data: sops } = await supabase
            .from('company_memories')
            .select('topic, content')
            .eq('company_id', companyId)
            .eq('memory_type', 'sop')
            .eq('is_current', true)
            .limit(10);

        // 2. Fetch Recent Decisions (Historical context)
        const { data: decisions } = await supabase
            .from('company_memories')
            .select('topic, content')
            .eq('company_id', companyId)
            .eq('memory_type', 'decision')
            .eq('is_current', true)
            .order('created_at', { ascending: false })
            .limit(10);

        // 3. Fetch Custom Company Rules (If any)
        const { data: rules } = await supabase
            .from('company_memories')
            .select('topic, content')
            .eq('company_id', companyId)
            .eq('memory_type', 'company_rule')
            .eq('is_current', true);

        return NextResponse.json({
            success: true,
            context: {
                sops: sops || [],
                decisions: decisions || [],
                rules: rules || []
            }
        });

    } catch (error) {
        console.error('Company Context Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch company context' }, { status: 500 });
    }
}