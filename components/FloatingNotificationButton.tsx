"use client"
import { NotificationCenter } from "./NotificationCenter"

export function FloatingNotificationButton() {
  return (
    <div className="fixed top-4 left-4 z-50">
      <NotificationCenter />
    </div>
  )
}
