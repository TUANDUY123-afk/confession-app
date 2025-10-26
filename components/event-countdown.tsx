"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface Event {
  id: string
  title: string
  date: string
  type?: string
}

interface EventCountdownProps {
  events: Event[]
}

export default function EventCountdown({ events }: EventCountdownProps) {
  const [upcomingEvents, setUpcomingEvents] = useState<Array<Event & { daysUntil: number }>>([])

  useEffect(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const upcoming = events
      .map(event => {
        const eventDate = new Date(event.date)
        eventDate.setHours(0, 0, 0, 0)
        const daysUntil = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return { ...event, daysUntil }
      })
      .filter(event => event.daysUntil >= 0) // Chỉ lấy sự kiện trong tương lai hoặc hôm nay
      .sort((a, b) => a.daysUntil - b.daysUntil) // Sắp xếp theo số ngày còn lại
      .slice(0, 5) // Chỉ hiển thị 5 sự kiện gần nhất

    setUpcomingEvents(upcoming)
  }, [events])

  const getEventIcon = (type?: string) => {
    switch (type) {
      case "birthday":
        return "🎂"
      case "important":
        return "💌"
      case "outing":
        return "🥰"
      case "travel":
        return "✈️"
      case "shopping":
        return "🛍️"
      case "dining":
        return "🍽️"
      case "netflix":
        return "🎬"
      case "cafe":
        return "☕"
      default:
        return "📅"
    }
  }

  const getProgressPercent = (daysUntil: number) => {
    // Giả sử timeline là 365 ngày, thì tỷ lệ sẽ là (365 - daysUntil) / 365
    // Nhưng nếu daysUntil > 365 thì hiển thị 100%
    const maxDays = 365
    if (daysUntil > maxDays) return 100
    return ((maxDays - daysUntil) / maxDays) * 100
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN", { day: "numeric", month: "long" })
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-pink-600">⏰ Sự kiện sắp tới</h3>
        </div>
        <p className="text-gray-500 text-center py-4">Chưa có sự kiện nào sắp tới 💭</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-bold text-pink-600">⏰ Sự kiện sắp tới</h3>
      </div>

      <div className="space-y-4">
        {upcomingEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-pink-100 hover:border-pink-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-2xl">{getEventIcon(event.type)}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 mb-1">{event.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${event.daysUntil === 0 ? 'text-pink-500' : event.daysUntil <= 3 ? 'text-rose-500' : 'text-pink-400'}`}>
                  {event.daysUntil}
                </div>
                <div className="text-xs text-gray-500">ngày</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${getProgressPercent(event.daysUntil)}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className={`h-full rounded-full ${
                    event.daysUntil === 0
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                      : event.daysUntil <= 3
                      ? 'bg-gradient-to-r from-rose-400 to-pink-400'
                      : 'bg-gradient-to-r from-pink-300 to-rose-300'
                  }`}
                />
              </div>
            </div>

            {/* Special indicator for today */}
            {event.daysUntil === 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-2 text-center text-sm font-semibold text-pink-600 bg-pink-100 rounded-full py-1"
              >
                🎉 Hôm nay là ngày này!
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
