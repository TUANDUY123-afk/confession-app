"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import LoveStoryHeader from "@/components/love-story-header"
import MilestoneList from "@/components/milestone-list"
import LoveCalendar from "@/components/love-calendar"
import EventCountdown from "@/components/event-countdown"
import FloatingHearts from "@/components/floating-hearts"
import { useNotifications } from "@/contexts/NotificationContext"
import { getCurrentUser } from "@/utils/user"

export default function LoveStoryPage() {
  const [startDate, setStartDate] = useState("")
  const [partnerName, setPartnerName] = useState("")
  const [daysTogether, setDaysTogether] = useState(0)
  const [milestones, setMilestones] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingDate, setEditingDate] = useState(false)

  const { addNotification } = useNotifications()
  const currentUser = getCurrentUser()

  // Danh sách mốc kỷ niệm mặc định
  const milestonesDefault = [
    { id: "7", days: 7, label: "1 tuần yêu nhau" },
    { id: "30", days: 30, label: "1 tháng yêu nhau" },
    { id: "50", days: 50, label: "50 ngày yêu" },
    { id: "100", days: 100, label: "100 ngày" },
    { id: "200", days: 200, label: "200 ngày" },
    { id: "300", days: 300, label: "300 ngày" },
    { id: "365", days: 365, label: "1 năm yêu nhau" },
    { id: "500", days: 500, label: "500 ngày" },
    { id: "730", days: 730, label: "2 năm yêu nhau" },
    { id: "1000", days: 1000, label: "3 năm yêu nhau" },
  ]

  // ✅ Load dữ liệu ban đầu
  useEffect(() => {
    const saved = localStorage.getItem("loveStoryData")
    if (saved) {
      const data = JSON.parse(saved)
      setStartDate(data.startDate || "")
      setPartnerName(data.partnerName || "")
      setMilestones(data.milestones || milestonesDefault)
    } else {
      setMilestones(milestonesDefault.map((m) => ({ ...m, completed: false })))
    }
    
    // Load events
    fetchEvents()
    
    setIsLoading(false)
  }, [])

  // Load events from API
  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/love-events")
      const { data } = await res.json()
      setEvents(data || [])
    } catch (error) {
      console.error("Error fetching events:", error)
    }
  }

  // Callback to refresh events
  const handleEventsChange = () => {
    fetchEvents()
  }

  // ✅ Tính số ngày yêu
  useEffect(() => {
    if (startDate) {
      const start = new Date(startDate)
      const today = new Date()
      if (!isNaN(start.getTime())) {
        const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        setDaysTogether(diff)
      }
    }
  }, [startDate])

  // ✅ Lưu vào localStorage
  useEffect(() => {
    if (!isLoading) {
      const data = { startDate, partnerName, milestones }
      localStorage.setItem("loveStoryData", JSON.stringify(data))
    }
  }, [startDate, partnerName, milestones, isLoading])

  // ✅ Khi chọn lại ngày kỷ niệm
  const handleChangeAnniversary = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate) return
    localStorage.setItem(
      "loveStoryData",
      JSON.stringify({ startDate, partnerName, milestones })
    )
    setEditingDate(false)
    addNotification({
      type: "event",
      message: `💞 Hai bạn đã chọn lại ngày kỷ niệm mới: ${new Date(startDate).toLocaleDateString("vi-VN")}`,
      author: currentUser?.name || "Ẩn danh",
    })
  }

  if (isLoading) return <div className="text-center py-20">Đang tải...</div>

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 py-12 overflow-hidden">
      {/* 💞 Hiệu ứng tim bay */}
      <FloatingHearts />
      
      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <Link href="/" className="flex items-center text-rose-500 mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Link>

        {/* Header có hiệu ứng tim mờ */}
        <LoveStoryHeader
          title={`Câu chuyện tình yêu của ${partnerName || "chúng ta"} 💕`}
          daysTogether={daysTogether}
          startDate={startDate}
        />

        {/* Nút đổi ngày kỷ niệm */}
        <div className="text-center mb-6">
          <button
            onClick={() => setEditingDate(!editingDate)}
            className="text-rose-600 hover:text-rose-700 font-medium underline"
          >
            ✨ Đổi ngày kỷ niệm
          </button>
        </div>

        {editingDate && (
          <form
            onSubmit={handleChangeAnniversary}
            className="bg-white/70 rounded-2xl shadow-md p-4 mb-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ngày kỷ niệm mới:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full mb-3 border rounded-lg p-2"
              required
            />
            <button
              type="submit"
              className="w-full bg-rose-500 hover:bg-rose-600 text-white py-2 rounded-xl transition-all"
            >
              💌 Lưu ngày kỷ niệm
            </button>
          </form>
        )}

        {/* Event Countdown */}
        <div className="mb-6">
          <EventCountdown events={events} />
        </div>

        {/* Love Calendar */}
        <div className="mb-6">
          <LoveCalendar onEventsChange={handleEventsChange} />
        </div>

        <MilestoneList
          milestones={milestones}
          currentDays={daysTogether}
          onMilestoneToggle={(id) => {
            const updated = milestones.map((m) =>
              m.id === id ? { ...m, completed: !m.completed } : m
            )
            setMilestones(updated)
          }}
        />
      </div>
    </main>
  )
}
