"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function SettingsModal({
  onClose,
  currentUser,
  onUserChange,
}: { onClose: () => void; currentUser: string; onUserChange: (newName: string) => void }) {
  const [newName, setNewName] = useState(currentUser)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!newName.trim()) {
      alert("Tên không được để trống 💌")
      return
    }

    setSaving(true)
    const cleanName = newName.trim()

    // ✅ Lưu local
    localStorage.setItem("lovable_user", cleanName)
    onUserChange(cleanName)

    // ✅ Gửi sự kiện toàn cục để thông báo các context khác
    window.dispatchEvent(new Event("user-updated"))

    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white/90 rounded-2xl shadow-xl p-6 max-w-md w-11/12 z-10 animate-fade-in">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-600 hover:text-gray-900">
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-center mb-6 text-pink-600">⚙️ Cài đặt</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tên của bạn 💖</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nhập tên mới..."
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 bg-white/80"
            disabled={saving}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 py-2 rounded-full bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-medium shadow-lg hover:scale-105 transition-all disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu ✨"}
          </button>
        </div>
      </div>
    </div>
  )
}
