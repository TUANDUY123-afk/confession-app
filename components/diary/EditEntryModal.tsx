"use client"

import { useState } from "react"
import { X } from "lucide-react"
import MoodBackground from "@/components/MoodBackground"
import { getCurrentUser } from "@/utils/user"

const moods = [
  { emoji: "🥰", label: "Yêu thương" },
  { emoji: "😊", label: "Hạnh phúc" },
  { emoji: "🥺", label: "Nhớ nhung" },
  { emoji: "😡", label: "Giận dỗi" },
  { emoji: "😭", label: "Buồn" },
  { emoji: "😍", label: "Siêu yêu" },
  { emoji: "😎", label: "Cool ngầu" },
  { emoji: "🤗", label: "Ôm ấp" },
  { emoji: "🎉", label: "Vui mừng" },
  { emoji: "💫", label: "Tự do" },
]

export default function EditEntryModal({ entry, onClose, onUpdate }) {
  const [content, setContent] = useState(entry.content)
  const [mood, setMood] = useState(entry.mood || "Yêu thương")
  const [saving, setSaving] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim()) return alert("Hãy viết gì đó 💌")

    setSaving(true)
    const currentUser = await getCurrentUser()
    const userName = currentUser?.name || entry.author

    try {
      const res = await fetch("/api/diary/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: entry.id,
          content,
          mood,
          title: entry.title,
          currentUserName: userName,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        onUpdate(data.entry)
        onClose()
      } else {
        alert("Cập nhật thất bại")
      }
    } catch (err) {
      console.error("Error updating entry:", err)
      alert("Lỗi khi cập nhật")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <MoodBackground mood={mood} />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Modal box */}
      <div className="relative bg-white/90 rounded-2xl shadow-xl p-6 max-w-md w-11/12 z-10 animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-center mb-4 text-pink-600">✏️ Sửa nhật ký</h2>

        {/* Mood picker */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2 text-center">Chọn tâm trạng 💭</p>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m.label)}
                className={`text-3xl transition-all rounded-xl p-2 ${
                  mood === m.label 
                    ? "scale-110 drop-shadow-lg bg-pink-100" 
                    : "opacity-60 hover:opacity-100 hover:bg-gray-100"
                }`}
                title={m.label}
              >
                {m.emoji}
              </button>
            ))}
          </div>
          <p className="text-xs text-center text-gray-500 mt-2">{mood}</p>
        </div>

        {/* Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chỉnh sửa nội dung nhật ký... 💖"
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
          {saving ? "Đang lưu..." : "Lưu thay đổi ✨"}
        </button>
      </div>
    </div>
  )
}
