"use client"

import { useState } from "react"
import { X, BookOpen } from "lucide-react"

export default function V4UpdateLog() {
  const [showLog, setShowLog] = useState(false)

  return (
    <>
      {/* Nút log ở góc màn hình */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowLog(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all font-semibold flex items-center gap-2 animate-pulse"
        >
          <BookOpen className="w-4 h-4" />
          <span>v4 Update</span>
        </button>
      </div>

      {/* Modal log */}
      {showLog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowLog(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                🌸 Cập nhật v4 - Hệ thống Hoa Mới
              </h2>
              <button
                onClick={() => setShowLog(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Giá mới của các loài hoa hiện có */}
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-5 border border-pink-200">
                <h3 className="text-lg font-bold text-pink-600 mb-4 flex items-center gap-2">
                  💰 Giá mới của các loài hoa hiện có
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌹 Hoa Hồng:</span>
                    <span className="font-bold text-pink-600">100 → <span className="text-green-600">150 xu</span> <span className="text-sm text-blue-600">(+50%)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌷 Hoa Tulip:</span>
                    <span className="font-bold text-pink-600">120 → <span className="text-green-600">180 xu</span> <span className="text-sm text-blue-600">(+50%)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌻 Hoa Hướng Dương:</span>
                    <span className="font-bold text-pink-600">150 → <span className="text-green-600">220 xu</span> <span className="text-sm text-blue-600">(+47%)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🤍 Hoa Nhài:</span>
                    <span className="font-bold text-pink-600">160 → <span className="text-green-600">240 xu</span> <span className="text-sm text-blue-600">(+50%)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🪻 Hoa Oải Hương:</span>
                    <span className="font-bold text-pink-600">180 → <span className="text-green-600">270 xu</span> <span className="text-sm text-blue-600">(+50%)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌸 Hoa Anh Đào:</span>
                    <span className="font-bold text-pink-600">200 → <span className="text-green-600">300 xu</span> <span className="text-sm text-blue-600">(+50%)</span></span>
                  </li>
                </ul>
              </div>

              {/* Các loài hoa mới */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border border-yellow-200">
                <h3 className="text-lg font-bold text-orange-600 mb-4 flex items-center gap-2">
                  🌺 Các loài hoa mới
                </h3>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🦋 Hoa Lan:</span>
                    <span className="font-bold text-orange-600">350 xu <span className="text-sm text-red-600">(Khó)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🪷 Hoa Sen:</span>
                    <span className="font-bold text-orange-600">400 xu <span className="text-sm text-purple-600">(Siêu Khó)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌺 Hoa Mẫu Đơn:</span>
                    <span className="font-bold text-orange-600">500 xu <span className="text-sm text-purple-600">(Siêu Khó)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">🌼 Hoa Hồng Vàng:</span>
                    <span className="font-bold text-orange-600">600 xu <span className="text-sm text-purple-900">(Cực Khó)</span></span>
                  </li>
                  <li className="flex items-center justify-between bg-white rounded-lg px-4 py-2">
                    <span className="text-gray-700">💎 Hoa Hồng Vĩnh Cửu:</span>
                    <span className="font-bold text-orange-600">800 xu <span className="text-sm text-purple-900">(Cực Khó)</span></span>
                  </li>
                </ul>
              </div>

              {/* Hệ thống độ khó mới */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-bold text-blue-600 mb-4 flex items-center gap-2">
                  🎯 Hệ thống độ khó mới
                </h3>
                <div className="space-y-3">
                  {/* Dễ */}
                  <div className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-green-600">Dễ (&lt; 200 xu)</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Thresholds: [0, 300, 700, 1200]</div>
                      <div className="font-semibold text-blue-600">Rewards: [40, 130, 300] xu</div>
                    </div>
                  </div>
                  
                  {/* Khó */}
                  <div className="bg-white rounded-lg p-4 border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-red-600">Khó (200-299 xu)</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Thresholds: [0, 500, 1000, 1500]</div>
                      <div className="font-semibold text-blue-600">Rewards: [60, 180, 500] xu</div>
                    </div>
                  </div>
                  
                  {/* Rất Khó */}
                  <div className="bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-600">Rất Khó (300-399 xu)</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Thresholds: [0, 600, 1200, 2000]</div>
                      <div className="font-semibold text-blue-600">Rewards: [70, 220, 600] xu</div>
                    </div>
                  </div>
                  
                  {/* Siêu Khó */}
                  <div className="bg-white rounded-lg p-4 border border-purple-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-700">Siêu Khó (400-599 xu)</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Thresholds: [0, 700, 1400, 2200]</div>
                      <div className="font-semibold text-blue-600">Rewards: [80, 250, 650] xu</div>
                    </div>
                  </div>
                  
                  {/* Cực Khó */}
                  <div className="bg-white rounded-lg p-4 border border-purple-400">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-purple-900">Cực Khó (≥ 600 xu)</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>Thresholds: [0, 800, 1600, 2500]</div>
                      <div className="font-semibold text-blue-600">Rewards: [100, 300, 800] xu</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer note */}
              <div className="text-center text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
                💡 Hoa càng khó, phần thưởng xu càng lớn! Chúc bạn vui vẻ với hệ thống mới!
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
