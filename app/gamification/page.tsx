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
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchPoints()
  }, [refreshKey])

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/gamification/points")
      const data = await res.json()
      setTotalPoints(data.total_points || 0)
    } catch (err) {
      console.error("Error fetching points:", err)
    }
  }

  const handleAddTestPoints = async (points: number) => {
    try {
      console.log("Adding points:", points)
      const response = await fetch("/api/gamification/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "test",
          points: points,
          description: `Test: Thêm ${points} điểm`,
        }),
      })
      
      const data = await response.json()
      console.log("Response:", data)
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add points")
      }
      
      // Refresh all components
      setRefreshKey(prev => prev + 1)
      alert(`✅ Đã thêm ${points} điểm!`)
    } catch (err) {
      console.error("Error adding points:", err)
      alert(`Lỗi khi thêm điểm 😢: ${err}`)
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
          <p className="text-gray-600 mb-4">
            Kiếm điểm, phát triển cây tình yêu và mở khóa thành tích!
          </p>
          
          {/* Test Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => handleAddTestPoints(10)}
              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition font-semibold"
            >
              +10 Điểm
            </button>
            <button
              onClick={() => handleAddTestPoints(50)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition font-semibold"
            >
              +50 Điểm
            </button>
            <button
              onClick={() => handleAddTestPoints(100)}
              className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-600 transition font-semibold"
            >
              +100 Điểm
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">🧪 Test buttons</p>
        </div>

        {/* Love Points */}
        <div className="mb-6" key={`points-${refreshKey}`}>
          <LovePointsDisplay />
        </div>

        {/* Love Tree */}
        <div className="mb-6" key={`tree-${refreshKey}`}>
          <LoveTree totalPoints={totalPoints} />
        </div>

        {/* Achievements */}
        <div className="mb-6" key={`achievements-${refreshKey}`}>
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
