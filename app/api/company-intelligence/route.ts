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

        // 1. Fetch REAL company memories to extract patterns
        const { data: memories } = await supabase
            .from('company_memories')
            .select('topic, memory_type, content, related_people')
            .eq('company_id', companyId)
            .eq('is_current', true)
            .limit(50);

        // 2. Fetch REAL task history to extract workflows
        const { data: tasks } = await supabase
            .from('veq_agent_tasks')
            .select('task_type, agent_type, ghost_name')
            .eq('company_id', companyId)
            .limit(100);

        // 3. Extract REAL terminology from memory topics
        const topicWords = (memories || []).flatMap((m: any) =>
            (m.topic || '').split(' ').filter((w: string) => w.length > 4 && !['about', 'with', 'from', 'that', 'this'].includes(w.toLowerCase()))
        );

        const terminologyFrequency = topicWords.reduce((acc: Record<string, number>, word: string) => {
            acc[word] = (acc[word] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const topTerminology = (Object.entries(terminologyFrequency) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([term, count]) => ({ term, usageCount: count }));

        // 4. Extract REAL workflow patterns from tasks
        const workflowFrequency = (tasks || []).reduce((acc: Record<string, number>, task: any) => {
            const workflow = task.task_type;
            if (workflow) {
                acc[workflow] = (acc[workflow] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const topWorkflows = (Object.entries(workflowFrequency) as [string, number][])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([workflow, count]) => ({
                name: workflow.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                executionCount: count
            }));

        // 5. Extract REAL decision patterns from memories
        const decisionMemories = (memories || []).filter((m: any) => m.memory_type === 'decision' || m.memory_type === 'lesson_learned');

        const decisions = decisionMemories.slice(0, 5).map((m: any) => ({
            topic: m.topic,
            context: (m.content || '').substring(0, 150) + ((m.content || '').length > 150 ? '...' : ''),
            relatedPeople: m.related_people || []
        }));

        // 6. Calculate REAL company uniqueness score
        // Based on: How many unique workflows + unique terminology + unique decisions
        const uniqueWorkflows = Object.keys(workflowFrequency).length;
        const uniqueTerms = Object.keys(terminologyFrequency).length;
        const uniqueDecisions = decisionMemories.length;

        const uniquenessScore = Math.min(100, (uniqueWorkflows * 5) + (uniqueTerms * 2) + (uniqueDecisions * 3));

        return NextResponse.json({
            success: true,
            intelligence: {
                terminology: topTerminology,
                workflows: topWorkflows,
                decisions,
                uniquenessScore,
                totalMemories: (memories || []).length,
                totalTasks: (tasks || []).length
            }
        });

    } catch (error) {
        console.error('Company Intelligence Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to extract company intelligence' }, { status: 500 });
    }
}