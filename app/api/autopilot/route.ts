import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

// Helper: Convert a real task row into a human-readable activity message
// This is a TEMPLATE MAPPER, not fake data. It uses REAL values from the database.
function formatActivityMessage(task: any): string {
    const agentName = (task.agent_type || 'Agent').replace('_agent', ' Agent').replace(/\b\w/g, (l: string) => l.toUpperCase());
    const target = task.ghost_name || 'a colleague';

    switch (task.task_type) {
        case 'client_onboarding':
            return task.status === 'completed'
                ? `${agentName} completed onboarding workflow for ${target}`
                : `${agentName} initiated onboarding workflow for ${target}`;
        case 'flag_undocumented_knowledge':
            return task.status === 'completed'
                ? `${agentName} captured undocumented knowledge from ${target}'s exit`
                : `${agentName} flagged undocumented knowledge for ${target}`;
        case 'create_draft_report':
            return `${agentName} prepared a draft report regarding ${target}`;
        case 'create_task':
            return `${agentName} created an internal task related to ${target}`;
        case 'send_email':
            return task.status === 'denied'
                ? `${agentName} was blocked from sending external email about ${target}`
                : `${agentName} prepared an email draft regarding ${target}`;
        case 'delete_task':
            return task.status === 'denied'
                ? `${agentName} was blocked from deleting records for ${target}`
                : `${agentName} processed a deletion request for ${target}`;
        case 'search_memory':
            return `${agentName} retrieved organizational memory about ${target}`;
        case 'view_documents':
            return `${agentName} accessed documents related to ${target}`;
        default:
            return `${agentName} processed an action for ${target}`;
    }
}

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

        // 1. Fetch REAL workflow stats from veq_agent_tasks
        const { count: totalMonitored } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        const { count: runningSuccessfully } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'completed');

        const { count: awaitingApproval } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'pending_approval');

        const { count: blocked } = await supabase
            .from('veq_agent_tasks')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'denied');

        // 2. Fetch REAL recent activity feed (latest 15 tasks)
        const { data: recentTasks, error: activityError } = await supabase
            .from('veq_agent_tasks')
            .select('task_type, agent_type, status, ghost_name, created_at')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false })
            .limit(15);

        if (activityError) {
            console.error('Activity feed error:', activityError);
        }

        // 3. Format each task into a real activity entry
        const activityFeed = (recentTasks || []).map(task => ({
            timestamp: new Date(task.created_at).toISOString(),
            message: formatActivityMessage(task),
            agentType: task.agent_type || 'unknown_agent',
            status: task.status
        }));

        return NextResponse.json({
            success: true,
            stats: {
                totalMonitored: totalMonitored || 0,
                runningSuccessfully: runningSuccessfully || 0,
                awaitingApproval: awaitingApproval || 0,
                blocked: blocked || 0
            },
            activityFeed
        });

    } catch (error) {
        console.error('Autopilot Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch autopilot data' }, { status: 500 });
    }
}