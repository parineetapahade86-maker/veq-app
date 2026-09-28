// app/api/marketplace/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getSupabase } from '@/lib/supabase/server'

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Fetch items and user credits
    const { data: items, error: itemsError } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

    const { data: credits, error: creditsError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single()

    if (itemsError) return NextResponse.json({ error: 'Failed to load items' }, { status: 500 })

    return NextResponse.json({
        items: items || [],
        userCredits: credits?.balance || 0
    })
}

export async function POST(req: Request) {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = getSupabase()
    if (!supabase) return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })

    // Get user name
    const { data: profile } = await supabase.from('user_profiles').select('full_name, email').eq('id', userId).single()
    const authorName = profile?.full_name || profile?.email || 'Anonymous'

    const body = await req.json()
    const { title, description, category, industry, content, price_credits } = body

    if (!title || !category) {
        return NextResponse.json({ error: 'Title and Category are required' }, { status: 400 })
    }

    const { data, error } = await supabase
        .from('marketplace_items')
        .insert({
            title, description, category, industry, content,
            price_credits: price_credits || 0,
            author_id: userId,
            author_name: authorName
        })
        .select()
        .single()

    if (error) return NextResponse.json({ error: 'Failed to publish item' }, { status: 500 })
    return NextResponse.json({ item: data })
}