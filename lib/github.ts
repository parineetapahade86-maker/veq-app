import { createClient } from '@/utils/supabase/server'

export async function getGitHubToken(userId: string) {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'github')
        .single()

    if (error || !data) {
        throw new Error('GitHub not connected')
    }

    return data.access_token
}

export async function fetchGitHubRepos(userId: string) {
    const token = await getGitHubToken(userId)

    const response = await fetch('https://api.github.com/user/repos', {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/json'
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch GitHub repos')
    }

    return response.json()
}

export async function fetchGitHubCommits(userId: string, owner: string, repo: string) {
    const token = await getGitHubToken(userId)

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits`,
        {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/json'
            }
        }
    )

    if (!response.ok) {
        throw new Error('Failed to fetch commits')
    }

    return response.json()
}