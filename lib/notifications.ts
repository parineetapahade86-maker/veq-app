import { createClient } from '@/utils/supabase/server'

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    link?: string
) {
    const supabase = await createClient()

    await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
        link: link || null,
        is_read: false
    })
}