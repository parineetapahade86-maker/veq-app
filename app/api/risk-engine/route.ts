// app/api/risk-engine/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // 1. Get current user's company
    const { data: profile } = await supabase.from('user_profiles').select('company_id').eq('id', userId).single()
    if (!profile?.company_id) return NextResponse.json({ alerts: [] })

    // 2. Fetch all employees and their knowledge items
    const { data: employees } = await supabase.from('user_profiles').select('id, full_name, email').eq('company_id', profile.company_id)
    const { data: knowledgeItems } = await supabase.from('knowledge_items').select('id, owner_id') // Assuming owner_id exists, or created_by

    // 3. Fetch recent activity (Last 30 days) from Audit Logs
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: recentLogs } = await supabase.from('audit_logs').select('user_id').eq('company_id', profile.company_id).gte('created_at', thirtyDaysAgo)

    if (!employees) return NextResponse.json({ alerts: [] })

    const alerts = []

    // 4. THE PREDICTIVE ALGORITHM
    for (const emp of employees) {
        const empId = emp.id
        const empName = emp.full_name || emp.email

        // Count how many knowledge items this employee owns
        const ownedItems = knowledgeItems?.filter(item => item.owner_id === empId).length || 0

        // Count their recent activity
        const recentActivity = recentLogs?.filter(log => log.user_id === empId).length || 0

        // Calculate Risk Score (Simple Heuristic)
        // High Knowledge + Low Activity = HIGH RISK (They might leave and take knowledge with them)
        let riskScore = 0
        let reason = ''

        if (ownedItems > 5 && recentActivity < 3) {
            riskScore = 85
            reason = `High Knowledge Concentration (${ownedItems} items) with dropping activity.`
        } else if (ownedItems > 2 && recentActivity < 5) {
            riskScore = 50
            reason = `Moderate knowledge risk detected.`
        } else {
            riskScore = 10
            reason = `Healthy engagement.`
        }

        alerts.push({
            user_id: empId,
            user_name: empName,
            risk_score: riskScore,
            risk_level: riskScore > 70 ? 'Critical' : riskScore > 40 ? 'Medium' : 'Low',
            reason: reason
        })
    }

    // 5. Save to Database (Optional, but good for history)
    // await supabase.from('knowledge_risk_alerts').insert(alerts.map(a => ({ ...a, company_id: profile.company_id })))

    return NextResponse.json({ alerts })
}