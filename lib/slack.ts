import { createClient } from '@/utils/supabase/server'

// Get user's Slack token from Supabase
export async function getSlackToken(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'slack')
        .single()

    if (error || !data) {
        throw new Error('Slack not connected')
    }

    return data.access_token
}

// Fetch Slack channels
export async function fetchSlackChannels(userId: string) {
    const token = await getSlackToken(userId)

    const response = await fetch('https://slack.com/api/conversations.list', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!data.ok) {
        throw new Error('Failed to fetch Slack channels')
    }

    return data.channels
}

// Fetch Slack messages from a channel
export async function fetchSlackMessages(userId: string, channelId: string, limit = 10) {
    const token = await getSlackToken(userId)

    const response = await fetch(
        `https://slack.com/api/conversations.history?channel=${channelId}&limit=${limit}`,
        {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }
    )

    const data = await response.json()

    if (!data.ok) {
        throw new Error('Failed to fetch Slack messages')
    }

    return data.messages
}

// Fetch Slack users
export async function fetchSlackUsers(userId: string) {
    const token = await getSlackToken(userId)

    const response = await fetch('https://slack.com/api/users.list', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    const data = await response.json()

    if (!data.ok) {
        throw new Error('Failed to fetch Slack users')
    }

    return data.members
}