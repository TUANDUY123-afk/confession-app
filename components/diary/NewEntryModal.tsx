"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { saveDiaryEntry } from "@/utils/storage"
import { getCurrentUser } from "@/utils/user"
import MoodBackground from "@/components/MoodBackground"
import { useNotifications } from "@/contexts/NotificationContext"

const moods = [
  { emoji: "🥰", label: "Yêu thương" },
  { emoji: "😊", label: "Hạnh phúc" },
  { emoji: "🥺", label: "Nhớ nhung" },
  { emoji: "😡", label: "Giận dỗi" },
  { emoji: "😭", label: "Buồn" },
]

export default function NewEntryModal({ onClose, onAdd }) {
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("Yêu thương")
  const [saving, setSaving] = useState(false)
  const { addNotification } = useNotifications()

  const handleSubmit = async () => {
    if (!content.trim()) return alert("Hãy viết gì đó 💌")

    setSaving(true)
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }

    // ✅ Sửa lỗi: getCurrentUser là async => cần await
    const currentUser = await getCurrentUser()
    const currentUserName = currentUser?.name || "Ẩn danh"

    const newEntry = {
      id: generateUUID(),
      author: currentUserName,
      date: new Date().toISOString(),
      mood,
      content,
    }

    await saveDiaryEntry(newEntry)
    onAdd(newEntry)
    onClose()
    setSaving(false)

    // ✅ Hiển thị tên đúng thay vì [object Promise]
    await addNotification({
      type: "diary",
      message: `${currentUserName} vừa đăng một bài viết mới 💌`,
      author: currentUserName,
    })
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <MoodBackground mood={mood} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div className="relative bg-white/90 rounded-2xl shadow-xl p-6 max-w-md w-11/12 z-10 animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-center mb-4 text-pink-600">
          💌 Viết nhật ký
        </h2>

        {/* Mood picker */}
        <div className="flex justify-around mb-4">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setMood(m.label)}
              className={`text-3xl transition-transform ${
                mood === m.label ? "scale-125 drop-shadow-lg" : "opacity-70"
              }`}
              title={m.label}
            >
              {m.emoji}
            </button>
          ))}
        </div>

        {/* Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Hôm nay bạn muốn viết gì cho người thương... 💖"
          className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 resize-none bg-white/80"
          rows={5}
          disabled={saving}
        />

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-4 w-full py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50"
        >
          {saving ? "Đang gửi..." : "Gửi nhật ký ✨"}
        </button>
      </div>
    </div>
  )
}
