"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoveTreeProps {
  totalPoints: number
}

export default function LoveTree({ totalPoints }: LoveTreeProps) {
  const getTreeLevel = (points: number) => {
    if (points >= 1000) return { level: 5, name: "Cây trưởng thành", emoji: "🌳", color: "from-green-500 to-emerald-600" }
    if (points >= 600) return { level: 4, name: "Nở hoa", emoji: "🌸", color: "from-pink-400 to-rose-600" }
    if (points >= 300) return { level: 3, name: "Cây con", emoji: "🌿", color: "from-green-400 to-green-600" }
    if (points >= 100) return { level: 2, name: "Chồi non", emoji: "🌱", color: "from-green-300 to-green-500" }
    return { level: 1, name: "Hạt giống", emoji: "🌰", color: "from-amber-400 to-amber-600" }
  }

  const getProgressToNext = (points: number) => {
    const thresholds = [0, 100, 300, 600, 1000]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (points >= thresholds[i]) {
        const nextLevel = thresholds[i + 1] || 1000
        const progress = ((points - thresholds[i]) / (nextLevel - thresholds[i])) * 100
        return { current: thresholds[i], next: nextLevel, progress: Math.min(100, progress) }
      }
    }
    return { current: 0, next: 100, progress: 0 }
  }

  const treeLevel = getTreeLevel(totalPoints)
  const progress = getProgressToNext(totalPoints)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">{treeLevel.emoji}</span>
        <h3 className="text-lg font-bold text-pink-600">Cây Tình Yêu</h3>
      </div>

      {/* Tree Visual */}
      <div className="flex items-end justify-center mb-6" style={{ height: '200px' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center"
        >
          <div className={`text-8xl mb-2 ${treeLevel.level >= 4 ? 'animate-pulse' : ''}`}>
            {treeLevel.emoji}
          </div>
          <div className="text-sm font-semibold text-gray-700">{treeLevel.name}</div>
          <div className="text-xs text-gray-500">Cấp độ {treeLevel.level}/5</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiến độ đến cấp tiếp theo</span>
          <span className="font-semibold text-pink-600">{progress.progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full bg-gradient-to-r ${treeLevel.color}`}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progress.current} điểm</span>
          <span>{progress.next} điểm</span>
        </div>
      </div>

      {/* Next Level Info */}
      {progress.next && progress.next > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600 bg-white/60 rounded-lg p-3">
          Cần thêm <span className="font-bold text-pink-600">{progress.next - totalPoints}</span> điểm để lên cấp tiếp theo! 💪
        </div>
      )}
    </motion.div>
  )
}
