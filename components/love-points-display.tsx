"use client"

import { useState, useEffect } from "react"
import { Star, Flame } from "lucide-react"
import { motion } from "framer-motion"

interface LovePointsDisplayProps {
  refreshKey?: number
  currentWater?: number  // Add optional prop for real-time water display
}

export default function LovePointsDisplay({ refreshKey, currentWater }: LovePointsDisplayProps) {
  const [pointsData, setPointsData] = useState({
    water: 0,
    current_streak: 0,
    longest_streak: 0,
    coins: 0,
  })
  const [loading, setLoading] = useState(true)
  
  // Update water immediately if currentWater prop is provided
  useEffect(() => {
    if (currentWater !== undefined) {
      setPointsData(prev => ({ ...prev, water: currentWater }))
    }
  }, [currentWater])

  useEffect(() => {
    fetchPoints()
  }, [refreshKey])

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/gamification/points")
      const data = await res.json()
      setPointsData(data)
    } catch (err) {
      console.error("Error fetching points:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md animate-pulse">
        <div className="h-20 bg-pink-100 rounded-lg"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-lg font-bold text-pink-600">💕 Love Points</h3>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Water */}
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-3 border border-blue-300">
          <div className="flex items-center gap-1 text-xs text-gray-700 mb-1">
            <span>💧</span>
            <span className="font-semibold">Nước</span>
          </div>
          <motion.div
            key={pointsData.water}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-blue-600"
          >
            {pointsData.water || 0}
          </motion.div>
        </div>

        {/* Current Streak */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-pink-100">
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
            <Flame className="w-3 h-3 text-orange-500" />
            Streak
          </div>
          <motion.div
            key={pointsData.current_streak}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-orange-500"
          >
            {pointsData.current_streak}
          </motion.div>
          <div className="text-xs text-gray-500">Kỷ lục: {pointsData.longest_streak}</div>
        </div>

        {/* Coins */}
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl p-3 border border-yellow-300">
          <div className="flex items-center gap-1 text-xs text-gray-700 mb-1">
            <span>🪙</span>
            <span className="font-semibold">Xu</span>
          </div>
          <motion.div
            key={pointsData.coins}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className="text-2xl font-bold text-yellow-600"
          >
            {pointsData.coins || 0}
          </motion.div>
        </div>
      </div>

      {pointsData.current_streak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm font-semibold text-orange-600 bg-orange-50 rounded-full py-2 px-4"
        >
          🔥 {pointsData.current_streak} ngày liên tục! Giữ vững nào! 💪
        </motion.div>
      )}
    </motion.div>
  )
}
