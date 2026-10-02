// app/api/my-work/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@/utils/supabase/server'

// GET: Fetch all tasks for the current user
export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get user's company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Fetch tasks from 'tasks' table (NOT knowledge table - 100% safe!)
        const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('employee_id', userId)
            .eq('company_id', profile.company_id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tasks:', error)
            return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data: tasks })

    } catch (error) {
        console.error('GET /api/my-work error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST: Create a new task
export async function POST(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await request.json()
        const { title, category, status = 'In Progress' } = body

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 })
        }

        // Get user's company_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('company_id')
            .eq('id', userId)
            .single()

        if (!profile?.company_id) {
            return NextResponse.json({ error: 'Company not found' }, { status: 404 })
        }

        // Insert into 'tasks' table (NOT knowledge table!)
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title,
                category: category || 'Focus',
                status,
                employee_id: userId,
                company_id: profile.company_id
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating task:', error)
            return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('POST /api/my-work error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT: Update a task (e.g., change status)
export async function PUT(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const body = await request.json()
        const { id, title, category, status } = body

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // Update in 'tasks' table
        const { data, error } = await supabase
            .from('tasks')
            .update({
                title: title,
                category: category,
                status: status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .eq('employee_id', userId) // Only update own tasks
            .select()
            .single()

        if (error) {
            console.error('Error updating task:', error)
            return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error('PUT /api/my-work error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE: Delete a task
export async function DELETE(request: Request) {
    try {
        const { userId } = await auth()
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
        }

        // Delete from 'tasks' table (NOT knowledge table - 100% safe!)
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)
            .eq('employee_id', userId) // Only delete own tasks

        if (error) {
            console.error('Error deleting task:', error)
            return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('DELETE /api/my-work error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}