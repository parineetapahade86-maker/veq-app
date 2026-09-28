// app/api/v1/knowledge-score/route.ts
import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET(req: Request) {
    // 1. Extract API Key from Header
    const authHeader = req.headers.get('authorization')
    const apiKey = authHeader?.replace('Bearer ', '')

    if (!apiKey) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 401 })
    }

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    // 2. Validate API Key
    const { data: keyData, error: keyError } = await supabase
        .from('api_keys')
        .select('company_id, is_active')
        .eq('key', apiKey)
        .single()

    if (keyError || !keyData || !keyData.is_active) {
        return NextResponse.json({ error: 'Invalid or Inactive API Key' }, { status: 403 })
    }

    // 3. Fetch Knowledge Health Score for this Company
    const { count: totalItems } = await supabase
        .from('knowledge_items')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', keyData.company_id)

    const { count: activeUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('company_id', keyData.company_id)

    // Simple Algorithm for MVP
    const score = Math.min(100, (totalItems || 0) * 10 + (activeUsers || 0) * 5)

    // 4. Return Public Data
    return NextResponse.json({
        company_id: keyData.company_id,
        knowledge_handover_score: score,
        total_knowledge_items: totalItems,
        active_employees: activeUsers,
        status: score > 70 ? 'Healthy' : score > 40 ? 'At Risk' : 'Critical'
    })
}