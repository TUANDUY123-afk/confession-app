"use client"

import { useNotifications } from "@/contexts/NotificationContext"

export function FloatingNotification() {
  // vẫn giữ hook để không lỗi khi import
  useNotifications()

  // 🔇 Tắt hoàn toàn hiển thị popup nền
  return null
}
