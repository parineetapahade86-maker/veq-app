// Jira API utility functions

const ATLASSIAN_API_BASE = 'https://api.atlassian.com'

// Get user's accessible Jira sites (Cloud IDs)
export async function fetchJiraSites(accessToken: string) {
    try {
        const response = await fetch(`${ATLASSIAN_API_BASE}/oauth/token/accessible-resources`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Jira sites')
        }

        const data = await response.json()
        return data // Array of sites with their cloudId and name
    } catch (error) {
        console.error('Error fetching Jira sites:', error)
        return []
    }
}

// Fetch Jira Issues from a specific site
export async function fetchJiraIssues(accessToken: string, cloudId: string) {
    try {
        const response = await fetch(`${ATLASSIAN_API_BASE}/ex/jira/${cloudId}/rest/api/3/search?jql=assignee=currentUser()&maxResults=20`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Jira issues')
        }

        const data = await response.json()
        return data.issues.map((issue: any) => ({
            id: issue.id,
            key: issue.key,
            summary: issue.fields.summary,
            status: issue.fields.status.name,
            priority: issue.fields.priority?.name || 'None',
            url: issue.self // You can construct the web URL from this
        }))
    } catch (error) {
        console.error('Error fetching Jira issues:', error)
        return []
    }
}