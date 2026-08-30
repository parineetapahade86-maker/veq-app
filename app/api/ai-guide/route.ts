import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'

// Import GitHub and Slack utilities
import { fetchGitHubRepos } from '@/lib/github'
import { fetchSlackChannels, fetchSlackMessages } from '@/lib/slack'

export async function POST(request: NextRequest) {
    try {
        const { query } = await request.json()

        // Get current user from Clerk
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        let context = ''
        const supabase = await createClient()

        // 1. Check GitHub connection
        const { data: githubData } = await supabase
            .from('user_integrations')
            .select('access_token')
            .eq('user_id', user.id)
            .eq('provider', 'github')
            .single()

        if (githubData) {
            try {
                const repos = await fetchGitHubRepos(user.id)
                context += `\n📦 GITHUB REPOSITORIES:\n${JSON.stringify(repos.map((r: any) => ({
                    name: r.name,
                    description: r.description,
                    updated_at: r.updated_at,
                    url: r.html_url
                })), null, 2)}\n`
            } catch (error) {
                context += '\n️ GitHub connected but failed to fetch data\n'
            }
        }

        // 2. Check Slack connection
        const { data: slackData } = await supabase
            .from('user_integrations')
            .select('access_token')
            .eq('user_id', user.id)
            .eq('provider', 'slack')
            .single()

        if (slackData) {
            try {
                const channels = await fetchSlackChannels(user.id)
                context += `\n SLACK CHANNELS:\n${JSON.stringify(channels.map((c: any) => ({
                    name: c.name,
                    purpose: c.purpose?.value
                })), null, 2)}\n`

                // Fetch recent messages from general channel
                const generalChannel = channels.find((c: any) => c.name === 'general')
                if (generalChannel) {
                    const messages = await fetchSlackMessages(user.id, generalChannel.id, 5)
                    context += `\n📨 RECENT SLACK MESSAGES:\n${JSON.stringify(messages.map((m: any) => ({
                        user: m.user,
                        text: m.text,
                        ts: m.ts
                    })), null, 2)}\n`
                }
            } catch (error) {
                context += '\n⚠️ Slack connected but failed to fetch data\n'
            }
        }

        // 3. Fetch user's tasks from database
        const { data: tasksData } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10)

        if (tasksData && tasksData.length > 0) {
            context += `\n✅ YOUR RECENT TASKS:\n${JSON.stringify(tasksData.map((t: any) => ({
                title: t.title,
                status: t.status,
                priority: t.priority,
                created: t.created_at
            })), null, 2)}\n`
        }

        // 4. Fetch user's meetings
        const { data: meetingsData } = await supabase
            .from('meetings')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .limit(5)

        if (meetingsData && meetingsData.length > 0) {
            context += `\n📅 YOUR RECENT MEETINGS:\n${JSON.stringify(meetingsData.map((m: any) => ({
                title: m.title,
                date: m.date,
                attendees: m.attendees
            })), null, 2)}\n`
        }

        // Prepare the prompt for Gemini
        const prompt = `You are VEQ AI, a helpful assistant for a productivity platform.

USER'S DATA CONTEXT:
${context || 'No integrations connected yet'}

USER'S QUESTION: "${query}"

Based on the user's data above, provide a helpful and specific answer. If no relevant data exists, acknowledge that and suggest what they could do. Keep responses concise and actionable.`

        // Call Gemini API
        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            }
        )

        if (!geminiResponse.ok) {
            throw new Error('Gemini API request failed')
        }

        const data = await geminiResponse.json()
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not process your request.'

        return NextResponse.json({
            response: aiResponse,
            hasData: !!context
        })

    } catch (error) {
        console.error('AI Guide error:', error)
        return NextResponse.json(
            {
                error: 'Failed to get AI response',
                response: 'Sorry, something went wrong. Please try again.'
            },
            { status: 500 }
        )
    }
}