"use client"

import { Button } from "@/components/ui/button"
import { useNotifications } from "@/contexts/NotificationContext"
import { useState } from "react"

export default function NotificationTester() {
  const { addNotification, notifications, unreadCount, markAllAsRead } = useNotifications()
  const [count, setCount] = useState(0)

  const handleTest = () => {
    const id = count + 1
    setCount(id)
    addNotification({
      type: "event",
      message: `🔔 Thông báo test số ${id}`,
      author: "Yến nhi",
    })
  }

  return (
    <div className="p-4 border rounded-xl bg-background shadow-md space-y-2">
      <h2 className="text-lg font-semibold">🧪 Test Notification</h2>
      <p className="text-sm text-muted-foreground">
        Có <strong>{unreadCount}</strong> thông báo chưa đọc.
      </p>
      <div className="flex gap-2">
        <Button onClick={handleTest}>Thêm thông báo mới</Button>
        <Button variant="outline" onClick={markAllAsRead}>
          Đánh dấu tất cả đã đọc
        </Button>
      </div>
      <ul className="mt-3 text-sm">
        {notifications.slice(0, 5).map((n) => (
          <li key={n.id} className={n.read ? "opacity-50" : ""}>
            {n.message}
          </li>
        ))}
      </ul>
    </div>
  )
}
