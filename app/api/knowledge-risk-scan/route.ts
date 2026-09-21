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

        // 1. Fetch ALL Graph Data (Nodes & Edges)
        const { data: nodes } = await supabase.from('memory_nodes').select('*').eq('company_id', companyId).eq('is_active', true);
        const { data: edges } = await supabase.from('memory_edges').select('*').eq('company_id', companyId).eq('is_active', true);

        // 2. Fetch Tasks (for Missing SOP detection)
        const { data: tasks } = await supabase.from('veq_agent_tasks').select('task_type').eq('company_id', companyId).eq('status', 'completed');

        // 3. Fetch SOPs (for Missing SOP detection)
        const { data: sops } = await supabase.from('company_memories').select('topic').eq('company_id', companyId).eq('memory_type', 'sop').eq('is_current', true);

        // ==========================================
        // ANALYSIS 1: SINGLE POINT OF FAILURE (Dependency Risk)
        // ==========================================
        const peopleNodes = (nodes || []).filter(n => n.node_type === 'person');
        const criticalDependencies = [];

        for (const person of peopleNodes) {
            // Find edges where this person is the source, connecting to a process or decision
            const personEdges = (edges || []).filter(e =>
                e.source_node_id === person.id &&
                ['process', 'decision', 'task'].includes(e.edge_type.replace('made_', '').replace('documented_', '').replace('created_', '')) // Simplified edge type matching
            );

            // In a real graph, we'd traverse. Here, we count direct critical connections.
            // Let's just count total critical edges connected to this person.
            const criticalEdgeCount = personEdges.length;

            if (criticalEdgeCount >= 3) { // Threshold: If a person is connected to 3+ critical items
                criticalDependencies.push({
                    personName: person.node_label,
                    criticalConnections: criticalEdgeCount,
                    riskLevel: criticalEdgeCount >= 5 ? 'high' : 'medium'
                });
            }
        }

        // Sort by highest connections
        criticalDependencies.sort((a, b) => b.criticalConnections - a.criticalConnections);

        // ==========================================
        // ANALYSIS 2: MISSING SOPs (Knowledge Gaps)
        // ==========================================
        const taskCounts: Record<string, number> = {};
        (tasks || []).forEach(t => { taskCounts[t.task_type] = (taskCounts[t.task_type] || 0) + 1; });

        const existingSopTopics = new Set((sops || []).map(s => s.topic.toLowerCase()));
        const knowledgeGaps = [];

        for (const [taskType, count] of Object.entries(taskCounts)) {
            // If a task is executed frequently (>= 3 times) but no SOP exists for it
            if (count >= 3 && !existingSopTopics.has(`sop: ${taskType}`.toLowerCase()) && !existingSopTopics.has(taskType.toLowerCase())) {
                knowledgeGaps.push({
                    processName: taskType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    executionCount: count,
                    riskLevel: count >= 10 ? 'high' : 'medium'
                });
            }
        }

        // ==========================================
        // CALCULATE OVERALL KNOWLEDGE RISK SCORE (0 to 100)
        // ==========================================
        let riskScore = 100; // Start at perfect health

        // Deduct for critical dependencies
        const highRiskPeople = criticalDependencies.filter(d => d.riskLevel === 'high').length;
        riskScore -= (highRiskPeople * 15);

        // Deduct for missing SOPs
        const highRiskGaps = knowledgeGaps.filter(g => g.riskLevel === 'high').length;
        riskScore -= (highRiskGaps * 10);

        // Clamp score between 0 and 100
        riskScore = Math.max(0, Math.min(100, riskScore));

        return NextResponse.json({
            success: true,
            riskScore,
            criticalDependencies: criticalDependencies.slice(0, 5), // Top 5
            knowledgeGaps: knowledgeGaps.slice(0, 5), // Top 5
            totalNodes: nodes?.length || 0,
            totalEdges: edges?.length || 0
        });

    } catch (error) {
        console.error('Knowledge Risk Scan Error:', error);
        return NextResponse.json({ success: false, error: 'Failed to scan knowledge risk' }, { status: 500 });
    }
}