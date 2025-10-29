"use client"

import { X } from "lucide-react"

interface WaterEarnInfoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function WaterEarnInfoModal({ isOpen, onClose }: WaterEarnInfoModalProps) {
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
            <span className="text-2xl">💡</span>
            <h2 className="text-2xl font-bold text-blue-600">
              Cách kiếm nước
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border-2 border-pink-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">❤️</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">Like nhật ký</div>
                  <div className="text-base text-blue-600 font-semibold">+3 nước 💧</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Thích một bài nhật ký của người yêu
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border-2 border-purple-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">💬</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">Comment</div>
                  <div className="text-base text-blue-600 font-semibold">+5 nước 💧</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Bình luận trên nhật ký hoặc ảnh
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">📝</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">Viết nhật ký</div>
                  <div className="text-base text-blue-600 font-semibold">+20 nước 💧</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Chia sẻ cảm xúc qua nhật ký hàng ngày
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border-2 border-cyan-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">📸</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">Upload ảnh</div>
                  <div className="text-base text-blue-600 font-semibold">+10 nước/ảnh 💧</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Chia sẻ khoảnh khắc qua ảnh
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-200 hover:shadow-lg transition-all">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">📅</div>
                <div>
                  <div className="font-bold text-gray-800 text-lg">Đăng bài trong lịch</div>
                  <div className="text-base text-blue-600 font-semibold">+50 nước 💧</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Thêm sự kiện tình yêu vào lịch của đôi ta
              </p>
            </div>
          </div>

          {/* Streak bonus info */}
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔥</div>
              <div>
                <div className="font-bold text-gray-800 text-lg">Streak Bonus</div>
                <div className="text-sm text-gray-600 mt-1">
                  Mỗi ngày có hoạt động đầu tiên: +10 nước × số ngày streak 💧
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Ví dụ: Streak 3 ngày = +30 nước mỗi ngày đầu tiên!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center text-sm text-gray-600">
          💡 Mẹo: Hoạt động đều đặn mỗi ngày để nhận bonus streak!
        </div>
      </div>
    </div>
  )
}

