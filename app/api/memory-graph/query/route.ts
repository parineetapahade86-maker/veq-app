import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================
// POST: Query the graph (traverse relationships)
// ============================================
export async function POST(req: Request) {
    try {
        const user = await currentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { companyId, query } = body;

        if (!companyId || !query) {
            return NextResponse.json({ error: 'companyId and query required' }, { status: 400 });
        }

        const { type, nodeId, depth = 2, filters = {} } = query;

        let result;

        switch (type) {
            case 'related_nodes':
                result = await getRelatedNodes(companyId, nodeId, depth, filters);
                break;

            case 'path_between':
                result = await findPathBetween(companyId, query.startNodeId, query.endNodeId);
                break;

            case 'nodes_by_type':
                result = await getNodesByType(companyId, filters.nodeType, filters.limit || 50);
                break;

            case 'graph_stats':
                result = await getGraphStats(companyId);
                break;

            default:
                return NextResponse.json({ error: 'Invalid query type' }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            query: type,
            result
        });

    } catch (error) {
        console.error('Memory Graph Query error:', error);
        return NextResponse.json({ error: 'Failed to execute query' }, { status: 500 });
    }
}

// ============================================
// HELPER: Get related nodes (traverse edges)
// ============================================
async function getRelatedNodes(companyId: string, nodeId: string, depth: number, filters: any) {
    // Get starting node
    const { data: startNode } = await supabase
        .from('memory_nodes')
        .select('*')
        .eq('id', nodeId)
        .eq('company_id', companyId)
        .single();

    if (!startNode) {
        return { error: 'Node not found' };
    }

    // BFS traversal
    const visited = new Set<string>([nodeId]);
    const queue = [{ nodeId, depth: 0 }];
    const relatedNodes = [startNode];
    const connectingEdges: any[] = [];

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.depth >= depth) continue;

        // Get edges from current node
        const { data: edges } = await supabase
            .from('memory_edges')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .or(`source_node_id.eq.${current.nodeId},target_node_id.eq.${current.nodeId}`);

        if (!edges) continue;

        for (const edge of edges) {
            connectingEdges.push(edge);

            const nextNodeId = edge.source_node_id === current.nodeId
                ? edge.target_node_id
                : edge.source_node_id;

            if (!visited.has(nextNodeId)) {
                visited.add(nextNodeId);

                // Get the node
                const { data: nextNode } = await supabase
                    .from('memory_nodes')
                    .select('*')
                    .eq('id', nextNodeId)
                    .single();

                if (nextNode) {
                    // Apply filters
                    if (filters.nodeType && nextNode.node_type !== filters.nodeType) {
                        continue;
                    }

                    relatedNodes.push(nextNode);
                    queue.push({ nodeId: nextNodeId, depth: current.depth + 1 });
                }
            }
        }
    }

    return {
        startNode,
        relatedNodes,
        connectingEdges,
        totalFound: relatedNodes.length
    };
}

// ============================================
// HELPER: Find path between two nodes
// ============================================
async function findPathBetween(companyId: string, startNodeId: string, endNodeId: string) {
    // Simple BFS to find shortest path
    const visited = new Set<string>();
    const queue = [{ nodeId: startNodeId, path: [startNodeId] }];

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current.nodeId === endNodeId) {
            // Found path, now get all nodes and edges
            const { data: nodes } = await supabase
                .from('memory_nodes')
                .select('*')
                .in('id', current.path);

            const edges: any[] = [];
            for (let i = 0; i < current.path.length - 1; i++) {
                const { data: edge } = await supabase
                    .from('memory_edges')
                    .select('*')
                    .eq('company_id', companyId)
                    .or(`and(source_node_id.eq.${current.path[i]},target_node_id.eq.${current.path[i + 1]}),and(source_node_id.eq.${current.path[i + 1]},target_node_id.eq.${current.path[i]})`)
                    .single();

                if (edge) edges.push(edge);
            }

            return { path: nodes, edges, pathLength: current.path.length };
        }

        if (visited.has(current.nodeId)) continue;
        visited.add(current.nodeId);

        // Get neighbors
        const { data: edges } = await supabase
            .from('memory_edges')
            .select('*')
            .eq('company_id', companyId)
            .eq('is_active', true)
            .or(`source_node_id.eq.${current.nodeId},target_node_id.eq.${current.nodeId}`);

        if (!edges) continue;

        for (const edge of edges) {
            const nextNodeId = edge.source_node_id === current.nodeId
                ? edge.target_node_id
                : edge.source_node_id;

            if (!visited.has(nextNodeId)) {
                queue.push({ nodeId: nextNodeId, path: [...current.path, nextNodeId] });
            }
        }
    }

    return { error: 'No path found' };
}

// ============================================
// HELPER: Get nodes by type
// ============================================
async function getNodesByType(companyId: string, nodeType: string, limit: number) {
    const { data: nodes } = await supabase
        .from('memory_nodes')
        .select('*')
        .eq('company_id', companyId)
        .eq('node_type', nodeType)
        .eq('is_active', true)
        .limit(limit);

    return { nodes: nodes || [], count: nodes?.length || 0 };
}

// ============================================
// HELPER: Get graph statistics
// ============================================
async function getGraphStats(companyId: string) {
    const { data: metadata } = await supabase
        .from('memory_graph_metadata')
        .select('*')
        .eq('company_id', companyId)
        .single();

    return metadata || { total_nodes: 0, total_edges: 0 };
}