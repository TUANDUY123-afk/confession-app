"use client"

import { useState } from "react"
import { X, Palette } from "lucide-react"
import { saveDiaryEntry } from "@/utils/storage"
import { getCurrentUser } from "@/utils/user"
import MoodBackground from "@/components/MoodBackground"
import { useNotifications } from "@/contexts/NotificationContext"

const emojis = [
  "🥰", "😊", "😍", "🥺", "😡", "😭", "😎", "🤗", "🎉", "💫",
  "❤️", "💕", "💖", "💗", "💓", "✨", "🌟", "💯", "🔥", "🎈",
  "🌙", "☀️", "🌈", "🎊", "🎁", "🎂", "🌸", "🌹", "🌺", "🌻"
]

const colors = [
  { name: "Hồng", gradient: "from-pink-400 to-rose-500", value: "pink" },
  { name: "Tím", gradient: "from-purple-400 to-pink-500", value: "purple" },
  { name: "Xanh dương", gradient: "from-blue-400 to-cyan-500", value: "blue" },
  { name: "Xanh lá", gradient: "from-green-400 to-emerald-500", value: "green" },
  { name: "Vàng", gradient: "from-yellow-400 to-orange-500", value: "yellow" },
  { name: "Đỏ", gradient: "from-red-400 to-pink-600", value: "red" },
  { name: "Cam", gradient: "from-orange-400 to-red-500", value: "orange" },
  { name: "Hồng nhạt", gradient: "from-pink-300 to-rose-400", value: "light-pink" },
]

// Helper to get current time in Vietnam timezone as UTC ISO string
// Strategy: Get what time it is NOW in VN, then create a UTC timestamp that when displayed in VN shows that time
function getVietnamTimeNow(): string {
  const now = new Date() // Current UTC time
  
  // Get VN time components using Intl API
  const vnTimeStr = now.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  })
  
  // Parse: "12/25/2024, 22:14:30"
  const [datePart, timePart] = vnTimeStr.split(", ")
  const [month, day, year] = datePart.split("/").map(Number)
  const [hour, minute, second] = timePart.split(":").map(Number)
  
  // Create UTC timestamp for these components
  // Date.UTC creates timestamp for 22:14 UTC
  // But we want timestamp for 22:14 VN (which is 15:14 UTC)
  // So: timestamp(22:14 UTC) - 7h = timestamp(15:14 UTC) = timestamp(22:14 VN)
  const utcTimestamp = Date.UTC(year, month - 1, day, hour, minute, second)
  const vnTimestamp = utcTimestamp - (7 * 60 * 60 * 1000) // Subtract 7 hours
  
  return new Date(vnTimestamp).toISOString()
}

export default function NewEntryModal({ onClose, onAdd }) {
  const [content, setContent] = useState("")
  const [mood, setMood] = useState("Tâm trạng của bạn")
  const [emoji, setEmoji] = useState("🥰")
  const [moodColor, setMoodColor] = useState("pink")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [customMoodName, setCustomMoodName] = useState("")
  const [saving, setSaving] = useState(false)
  const { addNotification } = useNotifications()

  const handleSubmit = async () => {
    if (!content.trim()) return alert("Hãy viết gì đó 💌")
    if (!customMoodName.trim()) return alert("Hãy đặt tên cho tâm trạng của bạn 💭")

    setSaving(true)
    const generateUUID = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    }

    const currentUser = await getCurrentUser()
    const currentUserName = currentUser?.name || "Ẩn danh"

    const finalMood = `${emoji} ${customMoodName.trim()}`

    const newEntry = {
      id: generateUUID(),
      author: currentUserName,
      date: getVietnamTimeNow(),
      mood: finalMood,
      moodColor: moodColor,
      moodEmoji: emoji,
      content,
    }

    // OPTIMIZED: Lưu vào localStorage ngay lập tức (optimistic update)
    if (typeof window !== "undefined") {
      try {
        const existingEntries = JSON.parse(localStorage.getItem("sharedDiary") || "[]")
        existingEntries.unshift(newEntry)
        localStorage.setItem("sharedDiary", JSON.stringify(existingEntries))
      } catch (err) {
        console.error("Error saving to localStorage:", err)
      }
    }

    // Hiển thị entry ngay lập tức và đóng modal
    onAdd(newEntry)
    onClose()
    setSaving(false)

    // Chạy server sync và notification ở background (không chờ response)
    Promise.all([
      saveDiaryEntry(newEntry).catch(err => {
        console.error("[v0] Background sync failed:", err)
        // Có thể thêm toast notification ở đây nếu muốn thông báo lỗi cho user
      }),
      addNotification({
        type: "diary",
        message: `${currentUserName} vừa đăng một bài viết mới 💌`,
        author: currentUserName,
      }).catch(err => {
        console.error("[v0] Notification failed:", err)
      })
    ])
  }

  const selectedColor = colors.find(c => c.value === moodColor)

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 overflow-y-auto py-8">
      {/* Dynamic Background based on selected color */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${selectedColor?.gradient || 'from-purple-500 to-pink-500'} transition-all duration-500`}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 max-w-lg w-11/12 z-10 animate-fade-in my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 p-2 rounded-xl hover:bg-gray-100 transition-all"
        >
          <X size={22} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="text-5xl">{emoji}</div>
          <div>
            <h2 className="text-2xl font-black text-gray-800">Viết nhật ký mới</h2>
            <p className="text-sm text-gray-500">Chia sẻ tâm trạng của bạn 💕</p>
          </div>
        </div>

        {/* Custom Mood Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên tâm trạng
          </label>
          <input
            type="text"
            value={customMoodName}
            onChange={(e) => setCustomMoodName(e.target.value)}
            placeholder="VD: Hôm nay thật tuyệt, Cảm thấy hạnh phúc..."
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-sm bg-white"
          />
        </div>

        {/* Emoji Picker */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Biểu tượng
            </label>
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-3xl hover:scale-110 transition-transform"
            >
              {emoji}
            </button>
          </div>
          {showEmojiPicker && (
            <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-3 bg-gray-50 rounded-2xl border-2 border-gray-200">
              {emojis.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    setEmoji(e)
                    setShowEmojiPicker(false)
                  }}
                  className="text-3xl hover:scale-125 transition-transform p-2 rounded-xl hover:bg-white"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color Picker */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="w-4 h-4 text-gray-700" />
            <label className="block text-sm font-semibold text-gray-700">
              Màu sắc
            </label>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {colors.map((color) => (
              <button
                key={color.value}
                onClick={() => setMoodColor(color.value)}
                className={`h-12 rounded-2xl bg-gradient-to-br ${color.gradient} transition-all ${
                  moodColor === color.value ? 'ring-4 ring-gray-400 scale-110 shadow-lg' : 'hover:scale-105'
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Content Input */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nội dung nhật ký
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Viết về những khoảnh khắc đáng nhớ hôm nay... 💖"
            className="w-full p-4 rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 resize-none bg-white transition-all"
            rows={6}
            disabled={saving}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 bg-gradient-to-r ${
            selectedColor?.gradient || 'from-purple-500 to-pink-500'
          }`}
        >
          {saving ? "Đang gửi..." : `${emoji} Gửi nhật ký`}
        </button>
      </div>
    </div>
  )
}
