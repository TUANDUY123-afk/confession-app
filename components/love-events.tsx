"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, CalendarPlus, Loader2 } from "lucide-react"

interface LoveEvent {
  id: string
  title: string
  date: string
  daysUntil: number
}

export default function LoveEvents() {
  const [events, setEvents] = useState<LoveEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch("/api/love-events", { cache: 'force-cache' })
      const { data, error } = await res.json()
      if (error) console.error("Error fetching events:", error)
      else {
        const today = new Date()
        const formatted = data.map((e: any) => {
          const eventDate = new Date(e.date)
          const diff = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          return { ...e, daysUntil: diff }
        })
        setEvents(formatted)
      }
    } catch (err) {
      console.error("Error fetching events:", err)
    }
    setLoading(false)
  }

  async function handleAddEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!title || !date) return
    try {
      const res = await fetch("/api/love-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, date }),
      })
      const { data, error } = await res.json()
      if (error) {
        alert("Lỗi khi thêm sự kiện 😢")
        console.error(error)
      } else {
        setEvents([...events, { ...data, daysUntil: calcDaysUntil(data.date) }])
        setTitle("")
        setDate("")
      }
    } catch (err) {
      alert("Lỗi khi thêm sự kiện 😢")
      console.error(err)
    }
  }

  async function handleDeleteEvent(id: string) {
    try {
      const res = await fetch("/api/love-events", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      const { error } = await res.json()
      if (error) {
        alert("Lỗi khi xoá sự kiện 😢")
        console.error(error)
      } else {
        setEvents(events.filter((e) => e.id !== id))
      }
    } catch (err) {
      alert("Lỗi khi xoá sự kiện 😢")
      console.error(err)
    }
  }

  function calcDaysUntil(date: string) {
    const today = new Date()
    const eventDate = new Date(date)
    // Sử dụng Math.floor thay vì Math.ceil để không bị lệch 1 ngày
    return Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  // 💖 Hiệu ứng tim bay khi hôm nay trùng sự kiện
  useEffect(() => {
    const todayEvents = events.filter((e) => {
      const d = new Date(e.date)
      const t = new Date()
      return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear()
    })

    if (todayEvents.length > 0) {
      const interval = setInterval(() => {
        const heart = document.createElement("div")
        heart.textContent = "💖"
        heart.style.position = "fixed"
        heart.style.left = Math.random() * 100 + "vw"
        heart.style.bottom = "0"
        heart.style.fontSize = Math.random() * 24 + 16 + "px"
        heart.style.opacity = "0.8"
        heart.style.zIndex = "9999"
        heart.style.animation = "floatUp 4s ease-out forwards"
        document.body.appendChild(heart)
        setTimeout(() => heart.remove(), 4000)
      }, 400)
      return () => clearInterval(interval)
    }
  }, [events])

  return (
    <div className="bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-gray-200 shadow-md">
      <h2 className="text-lg font-bold text-rose-600 mb-4 flex items-center gap-2">
        <CalendarPlus className="w-5 h-5 text-rose-500" /> Sự kiện tình yêu 💝
      </h2>

      <form onSubmit={handleAddEvent} className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Tên sự kiện..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-rose-300"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 bg-pink-50/50 focus:outline-none focus:ring-2 focus:ring-rose-300"
          required
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-rose-400 to-pink-500 text-white px-4 rounded-lg shadow hover:opacity-90 transition"
        >
          Thêm
        </button>
      </form>

      {loading && (
        <div className="flex justify-center py-6 text-pink-500">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      <div className="space-y-3">
        {!loading && events.length === 0 && (
          <p className="text-gray-500 text-sm italic text-center">Chưa có sự kiện nào 🌸</p>
        )}

        {events.map((event) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-between items-center bg-gradient-to-r from-pink-50 to-rose-50 border border-gray-200 rounded-lg p-3 shadow-sm"
          >
            <div>
              <p className="font-medium text-rose-600">{event.title}</p>
              <p className="text-xs text-gray-500">
                {new Date(event.date).toLocaleDateString("vi-VN")} —{" "}
                {event.daysUntil >= 0 ? `${event.daysUntil} ngày nữa` : `Đã qua ${-event.daysUntil} ngày`}
              </p>
            </div>
            <button
              onClick={() => handleDeleteEvent(event.id)}
              className="text-gray-400 hover:text-rose-500 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
