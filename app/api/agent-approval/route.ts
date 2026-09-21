import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getSupabase } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        // 1. Authentication Check
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
        }

        // 2. Fetch company context
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id || 'default';
        const { taskId } = await req.json();

        if (!taskId) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
        }

        // 3. Fetch the pending task securely (Ensure it belongs to this company)
        const { data: task, error: fetchError } = await supabase
            .from('veq_agent_tasks')
            .select('*')
            .eq('id', taskId)
            .eq('company_id', companyId)
            .eq('status', 'pending_approval')
            .single();

        if (fetchError || !task) {
            return NextResponse.json({ error: 'Task not found or already processed' }, { status: 404 });
        }

        // 4. THE "LEARN" STEP: Update Company Memory Graph ONLY IF APPROVED
        const taskPayload = task.payload as any;

        if (task.task_type === 'flag_undocumented_knowledge' && taskPayload?.pending_memory_data) {
            const memoryData = taskPayload.pending_memory_data;

            const { error: memoryError } = await supabase
                .from('company_memories')
                .insert({
                    company_id: companyId,
                    topic: memoryData.topic,
                    memory_type: memoryData.memory_type,
                    content: memoryData.content,
                    related_people: memoryData.related_people,
                    related_documents: memoryData.related_documents,
                    is_current: memoryData.is_current
                });

            if (memoryError) {
                console.error("Failed to learn and update memory graph:", memoryError);
            }
        }

        // 5. Mark the task as Completed (Verified by Human)
        const { error: updateError } = await supabase
            .from('veq_agent_tasks')
            .update({
                status: 'completed',
                approved_by: user.id,
                approved_at: new Date().toISOString()
            })
            .eq('id', task.id);

        if (updateError) throw updateError;

        // 6. Return Success
        return NextResponse.json({
            success: true,
            message: 'Task approved. VEQ has successfully learned from this outcome.'
        });

    } catch (error) {
        console.error('Approval Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to approve task' }, { status: 500 });
    }
}