import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// GET: Fetch graph data for visualization
// ============================================
export async function GET(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // 🔒 SECURITY FIX: Get company ID securely from the user's profile, NOT from URL params
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();

        const companyId = profile?.company_id;

        if (!companyId) {
            return NextResponse.json({ error: 'No company found' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const nodeType = searchParams.get('nodeType'); // Optional filter
        const limit = parseInt(searchParams.get('limit') || '100');

        // Fetch nodes
        let nodesQuery = supabase
            .from('memory_nodes')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .limit(limit);

        if (nodeType) {
            nodesQuery = nodesQuery.eq('node_type', nodeType);
        }

        const { data: nodes, error: nodesError } = await nodesQuery;
        if (nodesError) throw nodesError;

        // Fetch edges for these nodes
        const nodeIds = nodes?.map(n => n.id) || [];
        const { data: edges, error: edgesError } = await supabase
            .from('memory_edges')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .in('source_node_id', nodeIds)
            .limit(limit * 2);

        if (edgesError) throw edgesError;

        // Fetch metadata
        const { data: metadata } = await supabase
            .from('memory_graph_metadata')
            .select('*')
            .eq('company_id', companyId)
            .single();

        return NextResponse.json({
            success: true,
            nodes: nodes || [],
            edges: edges || [],
            metadata: metadata || { total_nodes: 0, total_edges: 0 }
        });

    } catch (error) {
        console.error('Memory Graph GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch graph' }, { status: 500 });
    }
}

// ============================================
// POST: Add nodes and edges to the graph
// ============================================
export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { companyId, nodes, edges, sourceType, sourceId } = body;

        if (!companyId) {
            return NextResponse.json({ error: 'companyId required' }, { status: 400 });
        }

        // Validate input
        if (!nodes && !edges) {
            return NextResponse.json({ error: 'nodes or edges required' }, { status: 400 });
        }

        let createdNodes: any[] = [];
        let createdEdges: any[] = [];

        // Insert nodes
        if (nodes && nodes.length > 0) {
            const nodesWithMetadata = nodes.map((node: any) => ({
                company_id: companyId,
                node_type: node.type,
                node_label: node.label,
                node_data: node.data || {},
                source_type: sourceType || 'manual',
                source_id: sourceId,
                created_by: user.id
            }));

            const { data: insertedNodes, error: nodesError } = await supabase
                .from('memory_nodes')
                .insert(nodesWithMetadata)
                .select();

            if (nodesError) throw nodesError;
            createdNodes = insertedNodes || [];
        }

        // Insert edges
        if (edges && edges.length > 0) {
            const edgesWithMetadata = edges.map((edge: any) => ({
                company_id: companyId,
                source_node_id: edge.sourceNodeId,
                target_node_id: edge.targetNodeId,
                edge_type: edge.type,
                edge_label: edge.label,
                edge_data: edge.data || {},
                source_type: sourceType || 'manual',
                source_id: sourceId,
                created_by: user.id
            }));

            const { data: insertedEdges, error: edgesError } = await supabase
                .from('memory_edges')
                .insert(edgesWithMetadata)
                .select();

            if (edgesError) throw edgesError;
            createdEdges = insertedEdges || [];
        }

        return NextResponse.json({
            success: true,
            nodes: createdNodes,
            edges: createdEdges,
            message: `Created ${createdNodes.length} nodes and ${createdEdges.length} edges`
        });

    } catch (error) {
        console.error('Memory Graph POST error:', error);
        return NextResponse.json({ error: 'Failed to create graph elements' }, { status: 500 });
    }
}

// ============================================
// DELETE: Soft-delete nodes/edges
// ============================================
export async function DELETE(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { nodeIds, edgeIds } = body;

        if (!nodeIds && !edgeIds) {
            return NextResponse.json({ error: 'nodeIds or edgeIds required' }, { status: 400 });
        }

        // Soft-delete nodes
        if (nodeIds && nodeIds.length > 0) {
            await supabase
                .from('memory_nodes')
                .update({ is_active: false, updated_at: new Date().toISOString() })
                .in('id', nodeIds);
        }

        // Soft-delete edges
        if (edgeIds && edgeIds.length > 0) {
            await supabase
                .from('memory_edges')
                .update({ is_active: false })
                .in('id', edgeIds);
        }

        return NextResponse.json({
            success: true,
            message: 'Graph elements deleted'
        });

    } catch (error) {
        console.error('Memory Graph DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete graph elements' }, { status: 500 });
    }
}