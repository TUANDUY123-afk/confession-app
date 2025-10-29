"use client"

import { useState, useEffect } from "react"
import { Plus, Settings, BookOpen } from "lucide-react"
import DiaryCard from "@/components/diary/DiaryCard"
import MoodBackground from "@/components/MoodBackground"
import FloatingHearts from "@/components/floating-hearts"
import NewEntryModal from "@/components/diary/NewEntryModal"
import EditEntryModal from "@/components/diary/EditEntryModal"
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
  const [selectedEntryForEdit, setSelectedEntryForEdit] = useState<any>(null)

  const showToast = (msg: string, duration = 3000) => {
    setToast(msg)
    setTimeout(() => setToast(null), duration)
  }

  const loadEntries = async () => {
    try {
      // OPTIMIZED: Include userName to get likes/comments in one call
      const res = await fetch(`/api/diary/load?userName=${currentUser || ""}`, { 
        cache: 'no-store',
        next: { revalidate: 0 }
      })
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

  // Reload when page becomes visible (user comes back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadEntries()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  const refreshEntries = async () => {
    try {
      const res = await fetch("/api/diary/load", { cache: "no-store" })
      const data = await res.json()
      setEntries(Array.isArray(data) ? data : [])
      showToast("✨ Đồng bộ thành công!")
    } catch (err) {
      showToast("❌ Đồng bộ thất bại")
      console.error("Lỗi khi đồng bộ:", err)
    }
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
        await loadEntries() // Refresh to get latest data
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
    <main className="relative min-h-screen flex flex-col items-center justify-start py-8 px-4 overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <MoodBackground mood={mood} />
      
      {/* 💞 Hiệu ứng tim bay */}
      <FloatingHearts />

      {/* Beautiful Header */}
      <div className="relative z-10 w-full max-w-3xl mb-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl transform hover:rotate-6 transition-transform">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
                <span className="text-xs">✨</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                Nhật Ký Đôi
              </h1>
              <p className="text-sm text-gray-500 font-medium mt-1">Chia sẻ yêu thương mỗi ngày 💕</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-sm"
            >
              + Viết mới
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-2xl bg-white/80 backdrop-blur-lg hover:bg-white transition-all shadow-lg hover:shadow-xl text-purple-600"
              title="Cài đặt"
            >
              <Settings size={22} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl pb-32">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-gray-600 mt-6 font-medium">Đang tải nhật ký...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-40 h-40 bg-gradient-to-br from-violet-400 to-pink-400 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce" style={{ animationDuration: '3s' }}>
                <BookOpen className="w-20 h-20 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mb-3">Chưa có nhật ký nào</h2>
            <p className="text-gray-600 text-center max-w-md mb-6">Bắt đầu viết nhật ký đầu tiên để lưu giữ những khoảnh khắc đáng nhớ cùng nhau 💕</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            >
              Viết nhật ký đầu tiên ✨
            </button>
          </div>
        ) : !currentUser ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
              <p className="text-gray-600 font-medium">Đang tải người dùng...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <div 
                key={entry.id} 
                className="animate-fade-in" 
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <DiaryCard
                  entry={entry}
                  onDelete={() => handleDeleteEntry(entry.id)}
                  onEdit={() => setSelectedEntryForEdit(entry)}
                  currentUserName={currentUser}
                  onRefresh={() => loadEntries()}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 w-20 h-20 flex items-center justify-center bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 text-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all hover:scale-110 group z-50"
      >
        <Plus size={36} className="group-hover:rotate-90 transition-transform duration-300 font-bold" />
      </button>

      {showModal && (
        <NewEntryModal
          onClose={() => setShowModal(false)}
          onAdd={async (entry) => {
            // Refresh to get data from server with latest likes/comments
            await loadEntries()
          }}
        />
      )}

      {selectedEntryForEdit && (
        <EditEntryModal
          entry={selectedEntryForEdit}
          onClose={() => setSelectedEntryForEdit(null)}
          onUpdate={async (updatedEntry) => {
            setSelectedEntryForEdit(null)
            showToast("✨ Đã cập nhật nhật ký!")
            // Reload to get fresh data from server
            await loadEntries()
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
