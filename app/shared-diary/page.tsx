"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Settings } from "lucide-react"
import DiaryCard from "@/components/diary/DiaryCard"
import MoodBackground from "@/components/MoodBackground"
import NewEntryModal from "@/components/diary/NewEntryModal"
import SettingsModal from "@/components/diary/SettingsModal"

function Toast({ message }: { message: string }) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-pink-600 text-white 
                  px-4 py-2 rounded-full shadow-lg text-sm animate-fade-in-out z-50"
    >
      {message}
    </div>
  )
}

export default function SharedDiaryPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [mood, setMood] = useState("Hạnh phúc")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)

  const showToast = (msg: string, duration = 3000) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  const loadEntries = async () => {
    try {
      const res = await fetch("/api/diary/load", { cache: "no-store" })
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Lỗi khi tải nhật ký:", err)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
    const savedUser = localStorage.getItem("lovable_user")
    if (savedUser) setCurrentUser(savedUser)
  }, [])

  const refreshEntries = async () => {
    showToast("Đang đồng bộ nhật ký... 💭")
    await loadEntries()
    showToast("✨ Đồng bộ thành công!")
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Bạn có chắc muốn xóa bài nhật ký này?")) return
    
    console.log("[Client] Attempting to delete entry:", entryId, "User:", currentUser)
    
    try {
      const res = await fetch("/api/diary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: entryId, currentUserName: currentUser }),
      })

      if (res.ok) {
        showToast("✨ Đã xóa bài nhật ký!")
        await refreshEntries()
      } else {
        const errorText = await res.text()
        console.error("Delete failed:", res.status, errorText)
        showToast("❌ Xóa thất bại, vui lòng thử lại")
      }
    } catch (err) {
      console.error("Error deleting entry:", err)
      showToast("❌ Xóa thất bại, vui lòng thử lại")
    }
  }

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-start py-8 px-4 overflow-y-auto">
      <MoodBackground mood={mood} />

      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-2">
          📖 Nhật ký đôi
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 rounded-full hover:bg-pink-100 transition-colors text-pink-600"
          title="Cài đặt"
        >
          <Settings size={24} />
        </button>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md pb-32">
        {loading ? (
          <p className="text-gray-500 text-center">Đang tải... ⏳</p>
        ) : entries.length === 0 ? (
          <p className="text-gray-500 text-center">Chưa có bài viết nào 💌</p>
        ) : !currentUser ? (
          <p className="text-gray-500 text-center">Đang tải người dùng... 💭</p>
        ) : (
          entries.map((entry) => (
            <DiaryCard
              key={entry.id}
              entry={entry}
              onDelete={() => handleDeleteEntry(entry.id)}
              currentUserName={currentUser}
            />
          ))
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-20 right-6 w-14 h-14 flex items-center justify-center 
                   rounded-full bg-gradient-to-r from-pink-500 to-rose-400 
                   text-white shadow-lg hover:scale-110 transition-transform"
      >
        <PlusCircle className="w-7 h-7" />
      </button>

      {showModal && (
        <NewEntryModal
          onClose={() => setShowModal(false)}
          onAdd={async (entry) => {
            setEntries([entry, ...entries])
            await refreshEntries()
          }}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          currentUser={currentUser || ""}
          onUserChange={(newName) => {
            setCurrentUser(newName)
            showToast(`✨ Đổi tên thành "${newName}" thành công!`)
          }}
        />
      )}

      {toast && <Toast message={toast} />}
    </main>
  )
}
