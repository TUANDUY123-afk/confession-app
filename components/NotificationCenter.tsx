"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNotifications } from "@/contexts/NotificationContext"
import { Heart, MessageCircle, ImageIcon, BookOpen, Trash2, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const [clickedNotifications, setClickedNotifications] = useState<Set<string>>(new Set())
  const router = useRouter()
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteAllNotifications, deleteNotification } = useNotifications()

  // Close when clicking outside
  const handleClickOutside = (e: React.MouseEvent) => {
    if (!e.target || !(e.target as Element).closest('.notification-panel') && !(e.target as Element).closest('.notification-button')) {
      setIsOpen(false)
    }
  }

  const handleNotificationClick = async (notif: any, e: React.MouseEvent) => {
    e.stopPropagation()
    
    console.log("Notification clicked:", notif.id, "Link:", notif.link)
    
    // Mark as read immediately
    await markAsRead(notif.id)
    
    // Navigate if link exists
    if (notif.link) {
      console.log("Navigating to:", notif.link)
      setIsOpen(false) // Close panel first
      await new Promise(resolve => setTimeout(resolve, 100)) // Small delay
      router.push(notif.link)
    } else {
      console.log("No link - notification marked as read only")
      setIsOpen(false) // Close panel even without link
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-red-500" />
      case "comment":
        return <MessageCircle className="w-4 h-4 text-blue-500" />
      case "photo":
        return <ImageIcon className="w-4 h-4 text-purple-500" />
      case "diary":
        return <BookOpen className="w-4 h-4 text-pink-500" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={(e) => {
            // Don't close if clicking inside notification panel
            const target = e.target as Element
            if (!target.closest('.notification-panel') && !target.closest('.notification-button')) {
              setIsOpen(false)
            }
          }}
        />
      )}
      <div className="fixed top-4 right-6 z-50 notification-button">
      {/* Nút chuông */}
      <button
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        className="relative p-3 rounded-full hover:bg-white/40 bg-white/30 backdrop-blur-md shadow-md transition-all duration-200 border border-pink-200"
        title="Thông báo"
      >
        <span className="text-xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto border border-pink-200 notification-panel"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white/90 border-b p-4 flex items-center justify-between rounded-t-xl">
              <h3 className="font-semibold text-gray-900 flex items-center gap-1">🔔 Thông báo</h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700"
                    title="Đánh dấu tất cả đã đọc"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    className="text-xs text-red-600 hover:text-red-700"
                    title="Xóa tất cả"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Danh sách */}
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>Không có thông báo nào 💨</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-100">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={(e) => {
                      console.log("Div clicked for notification:", notif.id)
                      handleNotificationClick(notif, e)
                    }}
                    className={`p-4 hover:bg-pink-100 transition-colors cursor-pointer ${
                      notif.read ? "opacity-70" : "bg-pink-50/60"
                    }`}
                    data-notif-id={notif.id}
                    data-has-link={!!notif.link}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                        {notif.author && <p className="text-xs text-gray-500 mt-1">Từ {notif.author}</p>}
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notif.timestamp).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notif.id)
                        }}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Xóa thông báo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </>
  )
}
