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

        // 1. Fetch REAL task history for this company
        // We only need task_type, status, created_at, and approved_at for calculations
        const { data: tasks, error } = await supabase
            .from('veq_agent_tasks')
            .select('task_type, status, created_at, approved_at')
            .eq('company_id', companyId);

        if (error) throw error;

        // 2. Aggregate REAL metrics in memory (100% Accurate, No Fake Numbers)
        const workflowStats = (tasks || []).reduce((acc: any, task: any) => {
            if (!acc[task.task_type]) {
                acc[task.task_type] = {
                    total: 0,
                    completed: 0,
                    denied: 0,
                    pending: 0,
                    completionTimes: [] // Store duration in days for completed tasks
                };
            }

            acc[task.task_type].total++;

            if (task.status === 'completed') {
                acc[task.task_type].completed++;
                // Calculate completion time if approved_at exists
                if (task.created_at && task.approved_at) {
                    const start = new Date(task.created_at).getTime();
                    const end = new Date(task.approved_at).getTime();
                    const days = (end - start) / (1000 * 60 * 60 * 24);
                    acc[task.task_type].completionTimes.push(days);
                }
            } else if (task.status === 'denied') {
                acc[task.task_type].denied++;
            } else if (task.status === 'pending_approval') {
                acc[task.task_type].pending++;
            }

            return acc;
        }, {});

        // 3. Format into Operational Intelligence metrics
        const intelligence = Object.entries(workflowStats).map(([workflow, stats]: [string, any]) => {
            // Calculate Average Completion Time (in days)
            const avgTime = stats.completionTimes.length > 0
                ? (stats.completionTimes.reduce((a: number, b: number) => a + b, 0) / stats.completionTimes.length).toFixed(1)
                : null;

            // Calculate Failure Rate (Denied / Total)
            const failureRate = stats.total > 0
                ? ((stats.denied / stats.total) * 100).toFixed(1)
                : "0.0";

            // Determine health status based on real metrics
            let status = 'green';
            if (parseFloat(failureRate) > 15) status = 'red'; // High failure rate
            else if (avgTime && parseFloat(avgTime) > 5) status = 'yellow'; // Takes too long

            return {
                workflowName: workflow.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                totalExecutions: stats.total,
                avgCompletionTime: avgTime ? `${avgTime} days` : 'N/A (Insufficient completed data)',
                failureRate: `${failureRate}%`,
                pendingCount: stats.pending,
                status
            };
        });

        // Sort by total executions (most used workflows first)
        intelligence.sort((a, b) => b.totalExecutions - a.totalExecutions);

        return NextResponse.json({
            success: true,
            intelligence
        });

    } catch (error) {
        console.error('Workflow Intelligence Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to calculate workflow metrics' }, { status: 500 });
    }
}