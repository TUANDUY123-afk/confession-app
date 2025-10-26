"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { getCurrentUser } from "@/utils/user"

export interface Notification {
  id: string
  type: "photo" | "comment" | "like" | "diary" | "event"
  message: string
  author?: string
  target?: string
  link?: string
  timestamp: string
  read: boolean
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  deleteAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [user, setUser] = useState<string | null>(null)
  const [localReadStatus, setLocalReadStatus] = useState<Set<string>>(new Set())

  // 🩵 Lấy thông báo
  const fetchNotifications = useCallback(async (username: string) => {
    if (!username) return
    try {
      const res = await fetch(`/api/notifications?user=${encodeURIComponent(username)}`)
      const data = await res.json()
      const list = Array.isArray(data.notifications) ? data.notifications : []

      console.log("Fetched notifications:", list.length)
      console.log("Checking read status for user:", username)

      // Check read status based on read_by array
      const notificationsWithReadStatus = list.map((n: any) => {
        const readByArray = n.read_by || []
        const isRead = readByArray.includes(username)
        
        console.log(`Notification ${n.id}: link="${n.link}"`, `read_by=${JSON.stringify(readByArray)}, isRead=${isRead}`)
        
        return {
          id: n.id,
          type: n.type || "event",
          message: n.message,
          author: n.author,
          target: n.target,
          link: n.link || undefined,
          timestamp: n.timestamp || n.created_at,
          read: isRead,
        }
      })
      
      // ✅ Preserve local read status during refetch
      const merged = notificationsWithReadStatus.map(n => ({
        ...n,
        read: localReadStatus.has(n.id) || n.read
      }))
      
      setNotifications(merged)
    } catch (err) {
      console.error("fetchNotifications error:", err)
    }
  }, [localReadStatus])

  // 🩵 Lấy user hiện tại & fetch lần đầu
  useEffect(() => {
    const init = async () => {
      const u = await getCurrentUser()
      if (u?.name) {
        setUser(u.name)
        // Fetch notifications will be called by the interval effect
      }
    }
    init()
  }, []) // Empty dependency array - only run once on mount

  // 🩵 Cập nhật mỗi 10s
  useEffect(() => {
    if (!user) return
    
    // Fetch immediately on user change
    fetchNotifications(user)
    
    // Then fetch every 10s
    const interval = setInterval(() => {
      fetchNotifications(user)
    }, 10000)
    return () => clearInterval(interval)
  }, [user])

  // 📨 Thêm thông báo mới (chỉ gọi API, không thêm local vì API đã tạo nhiều bản cho từng user)
  const addNotification = useCallback(async (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    try {
      const u = await getCurrentUser()
      const authorName = u?.name || "Ẩn danh"

      console.log("[addNotification] Called with:", notification.link)
      
      // Chỉ gọi API, không thêm vào local state
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...notification,
          author: authorName,
        }),
      })
      
      const result = await response.json()
      console.log("[addNotification] API response:", result)
      
      // Refetch notifications sau 3s để load từ API
      setTimeout(() => {
        if (user) {
          fetchNotifications(user)
        }
      }, 3000)
    } catch (err) {
      console.error("addNotification error:", err)
    }
  }, [user, fetchNotifications])

  // ✅ Đánh dấu 1 thông báo đã đọc (Optimized for instant UX)
  const markAsRead = useCallback(async (id: string) => {
    try {
      // ✅ Update local state FIRST (instant feedback)
      setLocalReadStatus((prev) => new Set([...prev, id]))
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

      const currentUser = await getCurrentUser()
      const username = currentUser?.name || "Ẩn danh"

      // ✅ Send to API in background (non-blocking)
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read_by: [username] }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Failed to mark as read in API:", response.status, errorText)
        // Revert local state only if API fails
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
      }
    } catch (err) {
      console.error("markAsRead error:", err)
      // Revert local state on error
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }
  }, [])

  // ✅ Đánh dấu tất cả đã đọc
  const markAllAsRead = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      const username = currentUser?.name || "Ẩn danh"

      console.log("Marking all as read for user:", username)

      // Update local state immediately
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))

      // Update API
      const response = await fetch("/api/notifications/mark-all-read", { 
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      })

      if (!response.ok) {
        console.error("Failed to mark all as read")
      } else {
        console.log("Successfully marked all as read")
      }
    } catch (err) {
      console.error("markAllAsRead error:", err)
    }
  }, [])

  // 🗑 Xóa 1 thông báo
  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
    } catch (err) {
      console.error("deleteNotification error:", err)
    }
  }, [])

  // 🧹 Xóa tất cả
  const deleteAllNotifications = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/all", { method: "DELETE" })
      
      if (response.ok) {
        // Only clear local state if API call succeeds
        setNotifications([])
      } else {
        console.error("Failed to delete all notifications")
        const error = await response.text()
        console.error("Error:", error)
      }
    } catch (err) {
      console.error("deleteAllNotifications error:", err)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider")
  return ctx
}
