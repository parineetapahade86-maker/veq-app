// Zendesk API utility functions

const getBaseUrl = () => `https://${process.env.ZENDESK_SUBDOMAIN}.zendesk.com/api/v2`

// Fetch user's tickets
export async function fetchZendeskTickets(accessToken: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/tickets.json`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Zendesk tickets')
        }

        const data = await response.json()
        return data.tickets.map((ticket: any) => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            priority: ticket.priority,
            created_at: ticket.created_at,
            updated_at: ticket.updated_at
        }))
    } catch (error) {
        console.error('Error fetching Zendesk tickets:', error)
        return []
    }
}

// Fetch organizations
export async function fetchZendeskOrganizations(accessToken: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/organizations.json`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch organizations')
        }

        const data = await response.json()
        return data.organizations || []
    } catch (error) {
        console.error('Error fetching Zendesk organizations:', error)
        return []
    }
}

// Fetch users
export async function fetchZendeskUsers(accessToken: string) {
    try {
        const response = await fetch(`${getBaseUrl()}/users.json`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        return data.users || []
    } catch (error) {
        console.error('Error fetching Zendesk users:', error)
        return []
    }
}