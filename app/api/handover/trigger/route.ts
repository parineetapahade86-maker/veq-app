// app/api/handover/trigger/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

interface TriggerHandoverRequest {
    employeeName?: string;
    slackUserId?: string;
}

interface SlackApiResponse {
    ok: boolean;
    channel?: { id: string };
    error?: string;
}

// 💬 Slack helper: open a DM channel and send a message
async function sendSlackDM(
    slackUserId: string,
    employeeName: string
): Promise<void> {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
        console.warn("⚠️ SLACK_BOT_TOKEN not configured — skipping Slack DM");
        return;
    }

    const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };

    const openDmRes = await fetch("https://slack.com/api/conversations.open", {
        method: "POST",
        headers,
        body: JSON.stringify({ users: slackUserId }),
    });

    const openDmData: SlackApiResponse = await openDmRes.json();

    if (!openDmData.ok || !openDmData.channel?.id) {
        console.warn(`️ Failed to open DM channel: ${openDmData.error}`);
        return;
    }

    const messageRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers,
        body: JSON.stringify({
            channel: openDmData.channel.id,
            text: `👋 Hey ${employeeName}! VEQ has initiated your **Continuity Handover**.`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: ` Hey *${employeeName}*!\n\nVEQ has initiated your *Continuity Handover*. ️\n\nOver the next 30 days, let's secure your legacy — step by step, with zero extra stress. Your knowledge will stay safe with the company, forever!\n\nNo massive documents. Just a few 5-minute micro-tasks. Your first task is ready on your VEQ dashboard. 🧠✨`,
                    },
                },
            ],
        }),
    });

    const messageData: SlackApiResponse = await messageRes.json();

    if (!messageData.ok) {
        console.warn(`⚠️ Slack message failed: ${messageData.error}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { employeeName, slackUserId }: TriggerHandoverRequest = await req.json();

        if (!employeeName || typeof employeeName !== "string" || !employeeName.trim()) {
            return NextResponse.json(
                { error: "Employee name is required" },
                { status: 400 }
            );
        }

        const trimmedName = employeeName.trim();

        // 1. Fetch REAL Prompts from Database (No hardcoded arrays!)
        const { data: prompts, error: promptsError } = await supabase
            .from("prompt_templates")
            .select("*")
            .order("day_number", { ascending: true });

        if (promptsError || !prompts || prompts.length === 0) {
            console.error("❌ No prompt templates found in DB:", promptsError);
            return NextResponse.json(
                { error: "System configuration missing. Please add prompt templates." },
                { status: 500 }
            );
        }

        // 2. Save Handover Session to Supabase Database
        const { data: session, error: dbError } = await supabase
            .from("handover_sessions")
            .insert([
                {
                    employee_name: trimmedName,
                    employee_slack_id: slackUserId || null,
                    status: "initiated",
                    days_remaining: 30,
                },
            ])
            .select()
            .single();

        if (dbError) {
            console.error("❌ Database Error (Session):", dbError);
            return NextResponse.json(
                { error: "Failed to create session", details: dbError.message },
                { status: 500 }
            );
        }

        // 3. 🚀 Auto-Generate Micro-Tasks using REAL DB Prompts
        const tasksToInsert = prompts.map((prompt: any) => ({
            employee_name: trimmedName,
            day_number: prompt.day_number,
            prompt: prompt.prompt,
            response_type: prompt.response_type,
            status: "pending"
        }));

        const { error: tasksError } = await supabase
            .from("micro_tasks")
            .insert(tasksToInsert);

        if (tasksError) {
            console.error("❌ Database Error (Micro-Tasks):", tasksError);
        }

        // 4. Send Slack DM (non-blocking)
        if (slackUserId) {
            sendSlackDM(slackUserId, trimmedName).catch((slackError) =>
                console.error("⚠️ Slack DM failed (continuing anyway):", slackError)
            );
        }

        return NextResponse.json({
            success: true,
            message: `Handover and micro-tasks initiated for ${trimmedName}`,
            session,
        });
    } catch (error) {
        console.error("❌ Handover Trigger Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}