// Notion API utility functions

const NOTION_API_BASE = 'https://api.notion.com/v1'

// Fetch user's Notion pages
export async function fetchNotionPages(accessToken: string) {
    try {
        const response = await fetch(`${NOTION_API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: '',
                filter: {
                    property: 'object',
                    value: 'page'
                },
                page_size: 20
            })
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Notion pages')
        }

        const data = await response.json()

        return data.results.map((page: any) => ({
            id: page.id,
            title: page.properties?.title?.title?.[0]?.plain_text || 'Untitled',
            url: page.url,
            last_edited: page.last_edited_time,
            created: page.created_time
        }))
    } catch (error) {
        console.error('Error fetching Notion pages:', error)
        return []
    }
}

// Fetch user's Notion databases
export async function fetchNotionDatabases(accessToken: string) {
    try {
        const response = await fetch(`${NOTION_API_BASE}/search`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: '',
                filter: {
                    property: 'object',
                    value: 'database'
                },
                page_size: 20
            })
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Notion databases')
        }

        const data = await response.json()

        return data.results.map((db: any) => ({
            id: db.id,
            title: db.title?.[0]?.plain_text || 'Untitled Database',
            url: db.url,
            last_edited: db.last_edited_time
        }))
    } catch (error) {
        console.error('Error fetching Notion databases:', error)
        return []
    }
}

// Fetch page content
export async function fetchNotionPageContent(accessToken: string, pageId: string) {
    try {
        const response = await fetch(`${NOTION_API_BASE}/blocks/${pageId}/children`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Notion-Version': '2022-06-28'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch page content')
        }

        const data = await response.json()

        return data.results.map((block: any) => ({
            type: block.type,
            content: block[block.type]?.rich_text?.map((t: any) => t.plain_text).join('') || ''
        }))
    } catch (error) {
        console.error('Error fetching Notion page content:', error)
        return []
    }
}