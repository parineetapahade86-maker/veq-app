// Asana API utility functions

const ASANA_API_BASE = 'https://app.asana.com/api/1.0'

// Fetch user info
export async function fetchAsanaUser(accessToken: string) {
    try {
        const response = await fetch(`${ASANA_API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Asana user')
        }

        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error fetching Asana user:', error)
        return null
    }
}

// Fetch user's workspaces
export async function fetchAsanaWorkspaces(accessToken: string) {
    try {
        const response = await fetch(`${ASANA_API_BASE}/users/me/workspaces`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch workspaces')
        }

        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error fetching Asana workspaces:', error)
        return []
    }
}

// Fetch projects from a workspace
export async function fetchAsanaProjects(accessToken: string, workspaceId: string) {
    try {
        const response = await fetch(`${ASANA_API_BASE}/workspaces/${workspaceId}/projects?opt_fields=name,owner,modified_at`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch projects')
        }

        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error fetching Asana projects:', error)
        return []
    }
}

// Fetch tasks from a project
export async function fetchAsanaTasks(accessToken: string, projectId: string) {
    try {
        const response = await fetch(`${ASANA_API_BASE}/projects/${projectId}/tasks?opt_fields=name,completed,assignee,due_on`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch tasks')
        }

        const data = await response.json()
        return data.data
    } catch (error) {
        console.error('Error fetching Asana tasks:', error)
        return []
    }
}