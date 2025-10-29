"use client"

import { useState, useEffect } from "react"
import { History, X, TrendingUp, TrendingDown } from "lucide-react"

interface WaterHistoryItem {
  id: string
  type: "add" | "subtract"
  amount: number
  description: string
  activity_type: string
  metadata?: any
  created_at: string
  formatted_date: string
}

interface WaterHistoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaterHistoryModal({ isOpen, onClose }: WaterHistoryModalProps) {
  const [history, setHistory] = useState<WaterHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchHistory()
    }
  }, [isOpen])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch("/api/gamification/water-history?limit=100")
      if (!res.ok) {
        throw new Error("Không thể tải lịch sử")
      }
      const data = await res.json()
      setHistory(data)
    } catch (err) {
      console.error("Error fetching water history:", err)
      setError("Đã xảy ra lỗi khi tải lịch sử")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-600">
              Lịch sử điểm nước
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition text-2xl hover:bg-gray-200 rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">💧</div>
              <div className="text-gray-600">Đang tải lịch sử...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚠️</div>
              <div className="text-red-600 font-semibold">{error}</div>
              <button
                onClick={fetchHistory}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Thử lại
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <div className="text-gray-600 font-semibold">Chưa có lịch sử</div>
              <div className="text-sm text-gray-500 mt-2">
                Lịch sử cộng/trừ điểm nước sẽ hiển thị tại đây
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-xl p-4 border-2 transition-all ${
                    item.type === "add"
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                      : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div
                        className={`rounded-full p-2 ${
                          item.type === "add"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {item.type === "add" ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-bold text-lg ${
                              item.type === "add" ? "text-green-700" : "text-red-700"
                            }`}
                          >
                            {item.type === "add" ? "+" : "-"}
                            {item.amount}
                          </span>
                          <span className="text-2xl">💧</span>
                        </div>
                        <div className="text-gray-700 font-medium text-sm">
                          {item.description}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          {item.formatted_date}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
          Tổng cộng: {history.length} bản ghi
        </div>
      </div>
    </div>
  )
}

