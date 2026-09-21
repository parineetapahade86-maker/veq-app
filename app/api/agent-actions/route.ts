import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { getAgentConfig } from '@/lib/agent-registry'; // 🔥 NEW: Single source of truth

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map action types to the permission level they require
const ACTION_PERMISSION_MAP: Record<string, 'read' | 'write' | 'approve' | 'send' | 'delete'> = {
    client_onboarding: 'write',
    create_draft_report: 'write',
    flag_undocumented_knowledge: 'write',
    create_task: 'write',
    send_email: 'send',
    approve_task: 'approve',
    delete_task: 'delete',
    view_documents: 'read',
    search_memory: 'read',
};

// 🔒 SECURITY FIX: Agent type is determined server-side based on the action.
// This prevents a malicious client from spoofing a higher-privilege agent.
const ACTION_TO_AGENT_MAP: Record<string, string> = {
    client_onboarding: 'onboarding_agent',
    create_draft_report: 'exit_agent',
    flag_undocumented_knowledge: 'exit_agent',
    create_task: 'process_agent',
    send_email: 'onboarding_agent',
    approve_task: 'manager_agent',
    delete_task: 'manager_agent',
    view_documents: 'knowledge_agent',
    search_memory: 'memory_agent',
};

const SUPPORTED_ACTIONS = Object.keys(ACTION_PERMISSION_MAP);

export async function POST(req: Request) {
    try {
        // 🔒 1. Require a real logged-in user — never trust identity from the request body
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { actionType, ghostName, auditReason } = body;

        // 2. Validate input
        if (!actionType || !SUPPORTED_ACTIONS.includes(actionType)) {
            return NextResponse.json({ success: false, error: 'Unsupported action type.' }, { status: 400 });
        }
        if (!ghostName) {
            return NextResponse.json({ success: false, error: 'ghostName is required' }, { status: 400 });
        }

        // Use the real authenticated user ID
        const requestedBy = user.id;

        // 3. Fetch company context for strict data isolation
        const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', requestedBy)
            .single();

        const companyId = userProfile?.company_id;
        if (!companyId) {
            return NextResponse.json({ success: false, error: 'No company found for this user' }, { status: 400 });
        }

        // 🔒 4. Confirm the target employee actually belongs to the requester's company
        // This prevents cross-company data access or manipulation
        const { data: employeeRecord } = await supabase
            .from('employees')
            .select('id')
            .eq('company_id', companyId)
            .eq('name', ghostName)
            .single();

        if (!employeeRecord) {
            return NextResponse.json({ success: false, error: 'Employee not found in your company' }, { status: 404 });
        }

        // 5. Determine the agent type server-side (immune to client spoofing)
        const agentType = ACTION_TO_AGENT_MAP[actionType] || 'exit_agent';

        // 🔥 NEW: Fetch agent configuration from the centralized registry
        const agentConfig = getAgentConfig(agentType);
        const requiredPermission = ACTION_PERMISSION_MAP[actionType];

        // 6. PERMISSION CHECK (The Security Gate) — now powered by registry
        if (!agentConfig.permissions[requiredPermission]) {
            // 🚨 SECURITY BREACH LOGGED
            await supabase.from('veq_agent_tasks').insert({
                requested_by: requestedBy,
                company_id: companyId,
                agent_type: agentType,
                ghost_name: ghostName,
                task_type: actionType,
                status: 'denied',
                audit_reason: `Permission denied: ${agentConfig.name} does not have ${requiredPermission} rights for ${actionType}.`,
                payload: { attempted_at: new Date().toISOString() },
            });

            return NextResponse.json(
                { success: false, error: `Security Violation: ${agentConfig.name} does not have permission to perform this action.` },
                { status: 403 }
            );
        }

        // 7. DETERMINE STATUS BASED ON RISK LEVEL (From Registry — no more hardcoded matrix)
        const riskLevel = agentConfig.defaultRiskLevel;
        const finalStatus = riskLevel === 'low' ? 'completed' : 'pending_approval';

        // 8. Build the payload — 100% real variables, ZERO fake business examples
        const payload: Record<string, unknown> = {
            action_initiated: actionType,
            target_entity: ghostName,
            initiated_by: requestedBy,
            timestamp: new Date().toISOString(),
            risk_level: riskLevel,
            status_note: riskLevel === 'low' ? 'Auto-completed (Low Risk)' : 'Pending human approval and review.',
        };

        // Prepare memory data for the "Verify → Learn" loop (only for medium risk)
        if (actionType === 'flag_undocumented_knowledge') {
            payload.pending_memory_data = {
                topic: `Handover Insight: ${ghostName}`,
                memory_type: 'lesson_learned',
                content: `Undocumented workflow or critical task captured during ${ghostName}'s exit process by ${requestedBy}. Requires review and formal documentation.`,
                related_people: [ghostName, requestedBy].filter(Boolean),
                related_documents: [],
                is_current: true,
            };
        }

        // 9. Save to Supabase (Full Audit Trail)
        const { data, error } = await supabase
            .from('veq_agent_tasks')
            .insert({
                requested_by: requestedBy,
                company_id: companyId,
                agent_type: agentType,
                ghost_name: ghostName,
                task_type: actionType,
                status: finalStatus, // Dynamically set based on risk
                audit_reason: auditReason || `User initiated ${actionType} for ${ghostName}`,
                payload: payload,
            })
            .select();

        if (error) throw error;

        // 10. Return dynamic success message based on risk level
        const successMessage = riskLevel === 'low'
            ? 'Action completed automatically! (Low Risk)'
            : 'Action initiated! Saved to the system with status: Pending Approval. A manager will review this shortly.';

        return NextResponse.json({ success: true, task: data[0], message: successMessage, riskLevel });

    } catch (error) {
        console.error('Agent Action Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to execute action' }, { status: 500 });
    }
}