// app/api/developer/keys/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

// GET: Fetch all API keys for the user's company
export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    // Get user's company
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

    if (!profile?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // Fetch API keys for this company
    const { data: keys, error } = await supabase
        .from('api_keys')
        .select('id, name, key, is_active, created_at')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Failed to fetch keys' }, { status: 500 })

    return NextResponse.json({ keys: keys || [] })
}

// POST: Generate a new API key
export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'DB Error' }, { status: 500 })

    const { name } = await req.json()
    if (!name?.trim()) return NextResponse.json({ error: 'Key name is required' }, { status: 400 })

    // Get user's company
    const { data: profile } = await supabase
        .from('user_profiles')
        .select('company_id')
        .eq('id', userId)
        .single()

    if (!profile?.company_id) return NextResponse.json({ error: 'Company not found' }, { status: 404 })

    // Generate UNIQUE API Key (Format: veq_live_xxxxxxxx)
    const uniqueKey = `veq_live_${uuidv4().replace(/-/g, '')}`

    // Insert into database
    const { data: newKey, error } = await supabase
        .from('api_keys')
        .insert({
            company_id: profile.company_id,
            name: name.trim(),
            key: uniqueKey,
            is_active: true
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating API key:', error)
        return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 })
    }

    return NextResponse.json({
        success: true,
        key: newKey,
        message: 'API key created successfully. This is the ONLY time it will be shown!'
    })
}