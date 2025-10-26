"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoveTreeProps {
  totalPoints: number
}

export default function LoveTree({ totalPoints }: LoveTreeProps) {
  const getTreeLevel = (points: number) => {
    if (points >= 5000) return { 
      level: 6, 
      name: "Cây tình yêu vĩnh cửu", 
      emoji: "🌹", 
      color: "from-red-500 to-pink-600",
      description: "Cây tình yêu của chúng ta đã nở hoa và mãi mãi xanh tươi",
      sparkles: "✨✨✨"
    }
    if (points >= 2000) return { 
      level: 5, 
      name: "Cây đang kết trái", 
      emoji: "🌳", 
      color: "from-green-500 to-emerald-600",
      description: "Cây đang ra hoa kết trái, tình yêu ngày càng đơm hoa",
      sparkles: "✨✨"
    }
    if (points >= 1000) return { 
      level: 4, 
      name: "Cây trưởng thành", 
      emoji: "🌲", 
      color: "from-green-400 to-green-600",
      description: "Cây đã lớn mạnh, lá xanh tươi tốt",
      sparkles: "✨"
    }
    if (points >= 500) return { 
      level: 3, 
      name: "Cây con", 
      emoji: "🌿", 
      color: "from-green-300 to-green-500",
      description: "Cây đang lớn dần, những cành lá mới nhú ra",
      sparkles: ""
    }
    if (points >= 200) return { 
      level: 2, 
      name: "Chồi non", 
      emoji: "🌱", 
      color: "from-green-200 to-green-400",
      description: "Mầm non đã nảy, cây bắt đầu mọc cao",
      sparkles: ""
    }
    return { 
      level: 1, 
      name: "Hạt giống tình yêu", 
      emoji: "🌰", 
      color: "from-amber-400 to-orange-500",
      description: "Hạt giống tình yêu vừa được gieo xuống",
      sparkles: ""
    }
  }

  const getProgressToNext = (points: number) => {
    const thresholds = [0, 200, 500, 1000, 2000, 5000]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (points >= thresholds[i]) {
        const nextLevel = thresholds[i + 1] || 5000
        const progress = ((points - thresholds[i]) / (nextLevel - thresholds[i])) * 100
        return { current: thresholds[i], next: nextLevel, progress: Math.min(100, progress) }
      }
    }
    return { current: 0, next: 200, progress: 0 }
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
      <div className="relative flex items-end justify-center mb-6 bg-gradient-to-b from-sky-50 to-green-50 rounded-xl p-8" style={{ height: '220px' }}>
        {/* Sparkles effect for high levels */}
        {treeLevel.level >= 4 && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="text-4xl">{treeLevel.sparkles}</div>
          </motion.div>
        )}
        
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
            y: treeLevel.level >= 5 ? [0, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center relative z-10"
        >
          <div className={`text-9xl mb-3 ${treeLevel.level >= 4 ? 'animate-pulse' : ''} filter drop-shadow-lg`}>
            {treeLevel.emoji}
          </div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-bold text-gray-800 mb-1"
          >
            {treeLevel.name}
          </motion.div>
          <div className="text-xs text-gray-600">Cấp độ {treeLevel.level}/6</div>
          {treeLevel.description && (
            <div className="text-xs text-gray-500 mt-2 italic max-w-xs">
              {treeLevel.description}
            </div>
          )}
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
      {progress.next && progress.next > 0 && progress.progress < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-gray-700 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-200"
        >
          <div className="font-semibold mb-1">🎯 Mục tiêu tiếp theo</div>
          <div>
            Cần thêm <span className="font-bold text-pink-600 text-lg">{progress.next - totalPoints}</span> điểm
          </div>
          <div className="text-xs text-gray-500 mt-1">
            để nâng cấp lên {treeLevel.level + 1}
          </div>
        </motion.div>
      )}

      {/* Max Level Celebration */}
      {treeLevel.level === 6 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mt-4 text-center text-sm bg-gradient-to-r from-yellow-200 via-pink-200 to-red-200 rounded-lg p-4 border-2 border-yellow-400"
        >
          <div className="text-2xl mb-2">🎉🌈✨</div>
          <div className="font-bold text-gray-800 mb-1">Chúc mừng!</div>
          <div className="text-xs text-gray-700">
            Bạn đã đạt cấp độ tối đa! Tình yêu của bạn đã nở hoa rực rỡ! 💕
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
