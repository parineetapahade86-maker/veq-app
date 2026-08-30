// Linear API utility functions

const LINEAR_API_URL = 'https://api.linear.app/graphql'

// Linear GraphQL query to fetch user's issues
export async function fetchLinearIssues(accessToken: string) {
    try {
        const response = await fetch(LINEAR_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
          query {
            issues(first: 20, filter: { state: { type: { neq: "completed" } } }) {
              nodes {
                id
                identifier
                title
                description
                state {
                  name
                  color
                }
                priority
                createdAt
                updatedAt
                assignee {
                  name
                }
                team {
                  name
                }
              }
            }
          }
        `
            })
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Linear issues')
        }

        const data = await response.json()
        return data.data.issues.nodes || []
    } catch (error) {
        console.error('Error fetching Linear issues:', error)
        return []
    }
}

// Fetch Linear projects
export async function fetchLinearProjects(accessToken: string) {
    try {
        const response = await fetch(LINEAR_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
          query {
            projects(first: 20) {
              nodes {
                id
                name
                description
                state
                startDate
                targetDate
                createdAt
                updatedAt
              }
            }
          }
        `
            })
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Linear projects')
        }

        const data = await response.json()
        return data.data.projects.nodes || []
    } catch (error) {
        console.error('Error fetching Linear projects:', error)
        return []
    }
}

// Create a new Linear issue
export async function createLinearIssue(
    accessToken: string,
    teamId: string,
    title: string,
    description?: string,
    priority?: number
) {
    try {
        const response = await fetch(LINEAR_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `
          mutation IssueCreate($input: IssueCreateInput!) {
            issueCreate(input: $input) {
              success
              issue {
                id
                identifier
                title
                state {
                  name
                }
              }
            }
          }
        `,
                variables: {
                    input: {
                        teamId,
                        title,
                        description: description || '',
                        priority: priority || 0
                    }
                }
            })
        })

        if (!response.ok) {
            throw new Error('Failed to create Linear issue')
        }

        const data = await response.json()
        return data.data.issueCreate
    } catch (error) {
        console.error('Error creating Linear issue:', error)
        return null
    }
}