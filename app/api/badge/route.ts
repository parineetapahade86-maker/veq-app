// app/api/badge/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Ya tumhara standard supabase client

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    if (!companyId) {
        return new NextResponse('Missing companyId', { status: 400 });
    }

    const supabase = await createClient();

    // 1. FETCH REAL DATA FROM SUPABASE (NO FAKE DATA!)
    const [knowledgeResult, meetingResult] = await Promise.all([
        supabase.from('employee_knowledge').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
        supabase.from('employee_knowledge').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('source_type', 'meeting')
    ]);

    const docCount = knowledgeResult.count ?? 0;
    const meetingCount = meetingResult.count ?? 0;

    // 2. CALCULATE REAL SCORE (Same logic as Team Control Room)
    let knowledgeScore = Math.min(docCount * 10, 60);
    let meetingScore = Math.min(meetingCount * 15, 30);
    let activityScore = docCount > 0 || meetingCount > 0 ? 10 : 0; // Base 10 if active
    let realScore = Math.min(knowledgeScore + meetingScore + activityScore, 100);

    // 3. DYNAMIC COLOR LOGIC
    let badgeColor = '#ef4444'; // Red (Default)
    let textColor = '#ffffff';

    if (realScore >= 70) {
        badgeColor = '#C6A15B'; // VEQ Gold (Premium look for high score!)
        textColor = '#3A2418';
    } else if (realScore >= 40) {
        badgeColor = '#eab308'; // Yellow
        textColor = '#000000';
    }

    // 4. GENERATE REAL SVG IMAGE
    const svg = `
    <svg width="220" height="30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:${badgeColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${badgeColor};stop-opacity:0.8" />
        </linearGradient>
      </defs>
      <rect width="220" height="30" rx="15" fill="url(#grad)" />
      <text x="15" y="20" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" font-weight="bold">
        ️ VEQ Verified
      </text>
      <text x="130" y="20" font-family="Arial, sans-serif" font-size="12" fill="${textColor}" font-weight="bold">
        Score: ${realScore}%
      </text>
    </svg>
    `;

    return new NextResponse(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'public, max-age=3600', // Cache for 1 hour so it doesn't hit DB every second
        },
    });
}