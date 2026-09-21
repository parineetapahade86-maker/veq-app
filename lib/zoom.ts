// Zoom API utility functions

const ZOOM_API_BASE = 'https://api.zoom.us/v2'

// Fetch user's meetings
export async function fetchZoomMeetings(accessToken: string) {
    try {
        const response = await fetch(`${ZOOM_API_BASE}/users/me/meetings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch Zoom meetings')
        }

        const data = await response.json()
        return data.meetings.map((meeting: any) => ({
            id: meeting.id,
            uuid: meeting.uuid,
            topic: meeting.topic,
            type: meeting.type,
            start_time: meeting.start_time,
            duration: meeting.duration,
            timezone: meeting.timezone,
            join_url: meeting.join_url
        }))
    } catch (error) {
        console.error('Error fetching Zoom meetings:', error)
        return []
    }
}

// Fetch meeting details
export async function fetchZoomMeetingDetails(accessToken: string, meetingId: string) {
    try {
        const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch meeting details')
        }

        const data = await response.json()
        return {
            id: data.id,
            uuid: data.uuid,
            topic: data.topic,
            type: data.type,
            start_time: data.start_time,
            duration: data.duration,
            agenda: data.agenda,
            join_url: data.join_url,
            host_email: data.host_email
        }
    } catch (error) {
        console.error('Error fetching Zoom meeting details:', error)
        return null
    }
}

// Fetch meeting recordings
export async function fetchZoomRecordings(accessToken: string, meetingId: string) {
    try {
        const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}/recordings`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch recordings')
        }

        const data = await response.json()
        return data.recording_files || []
    } catch (error) {
        console.error('Error fetching Zoom recordings:', error)
        return []
    }
}

// Fetch user info
export async function fetchZoomUserInfo(accessToken: string) {
    try {
        const response = await fetch(`${ZOOM_API_BASE}/users/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch user info')
        }

        const data = await response.json()
        return {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            type: data.type,
            role_name: data.role_name
        }
    } catch (error) {
        console.error('Error fetching Zoom user info:', error)
        return null
    }
}