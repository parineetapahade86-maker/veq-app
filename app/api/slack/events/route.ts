// app/api/slack/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { analyzeAndCaptureKnowledge } from '@/lib/ai/knowledge-detector';

/**
 * Slack Events API Route
 * Handles incoming Slack events (messages, reactions, etc.)
 */

// Handle GET request (URL verification challenge)
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const challenge = url.searchParams.get('challenge');

    return new NextResponse(challenge || '', {
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Handle POST request (actual Slack events)
export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const payload = JSON.parse(body);

        // 1. URL Verification (Slack sends this first)
        if (payload.type === 'url_verification') {
            return new NextResponse(payload.challenge, {
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // 2. Handle Event Callbacks
        if (payload.type === 'event_callback' && payload.event) {
            const event = payload.event;

            // Ignore bot messages and system events
            if (event.subtype || event.bot_id || event.user === undefined) {
                return new NextResponse('OK', { status: 200 });
            }

            // Only process message events
            if (event.type === 'message' && event.text) {
                console.log(' [Slack Event] Processing message:', {
                    channel: event.channel,
                    user: event.user,
                    text: event.text.substring(0, 50) + '...',
                });

                // Send to AI for analysis (fire and forget - don't wait)
                analyzeAndCaptureKnowledge(event.text, event.user)
                    .then((result) => {
                        if (result?.isValuable) {
                            console.log('✅ Knowledge captured successfully');
                        }
                    })
                    .catch((error) => {
                        console.error('❌ Error in knowledge capture:', error);
                    });
            }

            return new NextResponse('OK', { status: 200 });
        }

        // 3. Handle other event types
        return new NextResponse('OK', { status: 200 });

    } catch (error) {
        console.error('❌ [Slack Events] Error processing request:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}