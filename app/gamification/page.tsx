"use client"

import { useState, useEffect } from "react"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import LovePointsDisplay from "@/components/love-points-display"
import LoveTree from "@/components/love-tree"
import AchievementsDisplay from "@/components/achievements-display"
import FloatingHearts from "@/components/floating-hearts"

export default function GamificationPage() {
  const [totalPoints, setTotalPoints] = useState(0)

  useEffect(() => {
    fetchPoints()
  }, [])

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/gamification/points")
      const data = await res.json()
      setTotalPoints(data.total_points || 0)
    } catch (err) {
      console.error("Error fetching points:", err)
    }
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 py-12 overflow-hidden">
      {/* 💞 Hiệu ứng tim bay */}
      <FloatingHearts />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <Link href="/" className="flex items-center text-rose-500 mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-pink-600 mb-2">
            🎮 Hệ Thống Gamification
          </h1>
          <p className="text-gray-600">
            Kiếm điểm, phát triển cây tình yêu và mở khóa thành tích!
          </p>
        </div>

        {/* Love Points */}
        <div className="mb-6">
          <LovePointsDisplay />
        </div>

        {/* Love Tree */}
        <div className="mb-6">
          <LoveTree totalPoints={totalPoints} />
        </div>

        {/* Achievements */}
        <div className="mb-6">
          <AchievementsDisplay />
        </div>

        {/* Info Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 shadow-md">
          <h3 className="text-lg font-bold text-pink-600 mb-4">📊 Cách Kiếm Điểm</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold text-gray-800">Tham gia sự kiện đúng giờ</div>
                <div className="text-gray-600">+50 điểm mỗi sự kiện</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <div className="font-semibold text-gray-800">Ghi nhật ký sau sự kiện</div>
                <div className="text-gray-600">+30 điểm</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <div className="font-semibold text-gray-800">Thêm ảnh kỷ niệm</div>
                <div className="text-gray-600">+10 điểm mỗi ảnh</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💌</span>
              <div>
                <div className="font-semibold text-gray-800">Gửi tin nhắn yêu thương</div>
                <div className="text-gray-600">+5 điểm mỗi tin nhắn</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-800">Mở khóa thành tích</div>
                <div className="text-gray-600">Bonus 100-500 điểm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
