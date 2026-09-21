import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

export async function GET() {
    try {
        // 1. Authenticate User
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // 2. Fetch company context for strict data isolation
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;
        if (!companyId) {
            return NextResponse.json({ error: 'No company found for this user' }, { status: 400 });
        }

        // 3. Fetch REAL metrics from company_memories (Zero fake data)
        const { count: totalMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const { count: currentMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('is_current', true);

        const { count: outdatedMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('is_current', false);

        // 🔥 REAL CHECK: Count memories where owner is missing (null or empty string)
        const { count: missingOwnerMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .or('owner.is.null,owner.eq.""');

        // 4. Fetch REAL metrics from veq_agent_tasks
        const { count: totalTasks } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const { count: deniedTasks } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'denied');

        // 5. Calculate REAL Automation Readiness Score (0 to 100)
        const totalItems = (totalMemories || 0) + (totalTasks || 0);

        // Unhealthy items directly reduce the score
        const unhealthyItems = (outdatedMemories || 0) + (missingOwnerMemories || 0) + (deniedTasks || 0);
        const healthyItems = Math.max(0, totalItems - unhealthyItems);

        const readinessScore = totalItems > 0
            ? Math.round((healthyItems / totalItems) * 100)
            : 0; // Honest: If no data, score is 0.

        // 6. Build the EXACT 5 Indicators requested (100% Real Data Logic)
        const indicators = [
            {
                label: 'Knowledge Complete',
                status: (currentMemories || 0) > 0 ? 'green' : 'gray',
                message: (currentMemories || 0) > 0
                    ? `${currentMemories} documented nodes active`
                    : 'No knowledge captured yet'
            },
            {
                label: 'SOP Current',
                status: totalMemories === 0 ? 'gray' : ((outdatedMemories || 0) === 0 ? 'green' : 'red'),
                message: totalMemories === 0
                    ? 'No SOPs documented yet'
                    : ((outdatedMemories || 0) === 0 ? 'All processes are up to date' : `${outdatedMemories} processes are outdated`)
            },
            {
                label: 'Owner Missing',
                status: (missingOwnerMemories || 0) > 0 ? 'yellow' : 'green',
                message: (missingOwnerMemories || 0) > 0
                    ? `${missingOwnerMemories} items need an assigned owner`
                    : 'All items have assigned owners'
            },
            {
                label: 'Process Outdated',
                status: (outdatedMemories || 0) > 0 ? 'red' : 'green',
                message: (outdatedMemories || 0) > 0
                    ? `Review required for ${outdatedMemories} items`
                    : 'No outdated processes'
            },
            {
                label: 'Agent Cannot Safely Automate',
                status: (deniedTasks || 0) > 0 ? 'red' : 'green',
                message: (deniedTasks || 0) > 0
                    ? `${deniedTasks} unsafe actions blocked by security`
                    : 'No safety violations detected'
            }
        ];

        return NextResponse.json({
            success: true,
            readinessScore,
            totalItems,
            indicators
        });

    } catch (error) {
        console.error('Knowledge Health Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to calculate health metrics' }, { status: 500 });
    }
}