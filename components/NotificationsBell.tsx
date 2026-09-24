"use client"

import { useState, useEffect } from "react"
import { Bell, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useUser } from "@clerk/nextjs"

export default function NotificationsBell() {
    const { user } = useUser()
    const supabase = createClient()
    const [notifications, setNotifications] = useState<any[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        if (user) fetchNotifications()
    }, [user])

    const fetchNotifications = async () => {
        if (!user) return

        const { data } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(10)

        if (data) {
            setNotifications(data)
            setUnreadCount(data.filter(n => !n.is_read).length)
        }
    }

    const markAsRead = async (notificationId: string) => {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", notificationId)

        fetchNotifications()
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />
            case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-600" />
            case 'error': return <XCircle className="w-5 h-5 text-red-600" />
            default: return <Info className="w-5 h-5 text-blue-600" />
        }
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-muted hover:text-brown transition-colors"
            >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#F4EDE1] rounded-xl border border-gold/30 shadow-2xl z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-brown/10">
                        <h3 className="font-display text-lg text-brown italic">Notifications</h3>
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted text-sm">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="divide-y divide-brown/10">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => {
                                        markAsRead(notif.id)
                                        if (notif.link) window.location.href = notif.link
                                    }}
                                    className={`p-4 hover:bg-gold/10 cursor-pointer transition-colors ${!notif.is_read ? 'bg-gold/5' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getIcon(notif.type)}
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-brown text-sm">{notif.title}</h4>
                                            <p className="text-muted text-xs mt-1">{notif.message}</p>
                                            <p className="text-muted text-xs mt-2 opacity-60">
                                                {new Date(notif.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}