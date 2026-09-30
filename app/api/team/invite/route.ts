// app/api/team/invite/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'
import { triggerEventNotification } from '@/lib/notifications'

export async function POST(req: Request) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const supabase = await createClient()

        // 1. Get Founder's Company Details
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id, role, email')
            .eq('id', userId)
            .single()

        if (!profile?.company_id || profile.role !== 'founder') {
            return NextResponse.json({ error: 'Only founders can invite team members' }, { status: 403 })
        }

        // 2. Parse Request
        const { name, email, role } = await req.json()
        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 })
        }

        // 3. Add to Team Members Table
        const { data, error } = await supabase
            .from('team_members')
            .insert({
                company_id: profile.company_id,
                name,
                email,
                role: role || 'member',
                status: 'pending',
                knowledge_score: 0
            })
            .select()
            .single()

        if (error) {
            console.error('Team Invite DB Error:', error)
            return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
        }

        // 4. 🔥 TRIGGER NOTIFICATION (Founder ko alert ki naya member add hua)
        triggerEventNotification(
            profile.company_id,
            'document_added', // Reusing this event type for network growth, or create a new one
            `New team member invitation sent to ${name} (${email}).`,
            profile.email,
            undefined // No slack needed for this internal action
        )

        return NextResponse.json({ success: true, member: data })

    } catch (error) {
        console.error('Team Invite API Error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}