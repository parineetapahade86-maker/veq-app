import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return new Response('Missing CLERK_WEBHOOK_SECRET', { status: 400 });
    }

    const headersList = await headers();
    const svix_id = headersList.get('svix-id');
    const svix_timestamp = headersList.get('svix-timestamp');
    const svix_signature = headersList.get('svix-signature');

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', { status: 400 });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as unknown as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', { status: 400 });
    }

    const eventType = evt.type;

    //  JAB NAYA USER SIGN UP KARE
    if (eventType === 'user.created') {
        const { id, email_addresses, first_name, last_name } = evt.data;

        // Auto-create profile in Supabase
        await supabase.from('user_profiles').insert({
            id: id, // Clerk User ID
            email: email_addresses[0]?.email_address,
            role: 'user', // Default role
            company_id: null, // Pehle null, baad mein onboarding mein set hoga
            created_at: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true });
}