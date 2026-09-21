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

        // 1. REAL: Knowledge Health Metrics
        const { count: totalMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const { count: currentMemories } = await supabase
            .from('company_memories')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('is_current', true);

        // 2. REAL: Agent Performance (from veq_agent_tasks)
        const { data: agentStats } = await supabase
            .from('veq_agent_tasks')
            .select('agent_type, status')
            .eq('company_id', companyId);

        const agentPerformance = agentStats?.reduce((acc: any, task) => {
            const agent = task.agent_type || 'unknown';
            if (!acc[agent]) {
                acc[agent] = { total: 0, completed: 0, pending: 0, denied: 0 };
            }
            acc[agent].total++;
            if (task.status === 'completed') acc[agent].completed++;
            if (task.status === 'pending_approval') acc[agent].pending++;
            if (task.status === 'denied') acc[agent].denied++;
            return acc;
        }, {}) || {};

        // 3. REAL: Team Engagement (unique users who triggered actions)
        const { data: allTasks } = await supabase
            .from('veq_agent_tasks')
            .select('requested_by')
            .eq('company_id', companyId);

        const uniqueUsers = new Set(allTasks?.map(t => t.requested_by) || []);
        const activeUsersCount = uniqueUsers.size;

        // 4. REAL: Department Coverage (based on employees with handover data)
        const { count: totalEmployees } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const { count: employeesWithHandover } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('is_handover_initiated', true);

        // 5. REAL: Calculate Overall Health Score
        const totalItems = (totalMemories || 0) + (agentStats?.length || 0);
        const healthyItems = (currentMemories || 0) + (agentStats?.filter(t => t.status === 'completed').length || 0);
        const healthScore = totalItems > 0 ? Math.round((healthyItems / totalItems) * 100) : 0;

        return NextResponse.json({
            success: true,
            metrics: {
                knowledgeHealth: {
                    totalMemories: totalMemories || 0,
                    currentMemories: currentMemories || 0,
                    score: healthScore
                },
                agentPerformance,
                teamEngagement: {
                    activeUsers: activeUsersCount,
                    totalActions: agentStats?.length || 0
                },
                departmentCoverage: {
                    totalEmployees: totalEmployees || 0,
                    employeesWithHandover: employeesWithHandover || 0,
                    coveragePercentage: totalEmployees && totalEmployees > 0
                        ? Math.round(((employeesWithHandover || 0) / totalEmployees) * 100)
                        : 0
                }
            }
        });

    } catch (error) {
        console.error('CEO Dashboard Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch CEO metrics' }, { status: 500 });
    }
}