import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) return NextResponse.json({ success: false }, { status: 400 });

    const { data: employee, error } = await supabase
        .from('employees')
        .select('id, name, email, company_id, offboarding_status, token_expires_at')
        .eq('offboarding_token', token)
        .single();

    if (error || !employee) return NextResponse.json({ success: false }, { status: 404 });

    // Check expiration
    if (new Date(employee.token_expires_at) < new Date()) {
        return NextResponse.json({ success: false, error: 'Token expired' }, { status: 401 });
    }

    return NextResponse.json({ success: true, employee });
}