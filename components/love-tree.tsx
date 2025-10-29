"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

interface LoveTreeProps {
  totalPoints: number
  currentFlower?: string
}

export default function LoveTree({ totalPoints, currentFlower }: LoveTreeProps) {
  // Stage emojis matching MyFlowers component
  const getStageEmojis = (flowerId?: string) => {
    const emojis: { [key: string]: string[] } = {
      rose: ["🌱", "🌿", "🌺", "🌹"],
      cherry: ["🌱", "🌿", "🌳", "🌸"],
      sunflower: ["🌱", "🌿", "🌾", "🌻"],
      tulip: ["🌱", "🌿", "🌷", "🌷"],
      lavender: ["🌱", "🌿", "🪻", "🪻"],
      jasmine: ["🌱", "🌿", "🤍", "🤍"],
      orchid: ["🌱", "🌿", "🌺", "🦋"],
      lotus: ["🌱", "🌿", "🌷", "🪷"],
      peony: ["🌱", "🌿", "🌺", "🌺"],
      "rose-gold": ["🌱", "🌿", "🌼", "🌼"],
      "eternal-rose": ["🌱", "🌿", "💎", "💎"]
    }
    return emojis[flowerId || ""] || ["🌱", "🌿", "🌺", "🌹"]
  }

  // Giảm độ khó - thresholds thấp hơn
  const getTreeLevel = (points: number, flower?: string) => {
    // Nếu user đã mua hoa, show các giai đoạn phát triển của hoa đó
    const emojis = getStageEmojis(flower)
    
    if (flower === "rose") {
      if (points >= 700) return { 
        level: 4, name: "Hoa Hồng Nở Rộ", emoji: emojis[3], color: "from-red-500 to-pink-600",
        description: "Hoa hồng nở rộ đỏ thắm - tình yêu đam mê", sparkles: "✨✨✨"
      }
      if (points >= 300) return { 
        level: 3, name: "Hoa Hồng Chớm Nở", emoji: emojis[2], color: "from-pink-400 to-red-500",
        description: "Hoa hồng đang hé nở những cánh đầu tiên", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Hồng", emoji: emojis[0], color: "from-pink-300 to-red-400",
        description: "Mầm hoa hồng đang lớn dần", sparkles: "✨"
      }
    }
    if (flower === "cherry") {
      if (points >= 2000) return { 
        level: 4, name: "Anh Đào Nở Rộ", emoji: emojis[3], color: "from-pink-400 to-rose-500",
        description: "Hoa anh đào nở rộ như tuyết rơi", sparkles: "✨✨✨"
      }
      if (points >= 1200) return { 
        level: 3, name: "Anh Đào Chớm Nở", emoji: emojis[2], color: "from-pink-300 to-rose-400",
        description: "Cây anh đào bắt đầu ra hoa", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Anh Đào", emoji: emojis[0], color: "from-green-300 to-pink-300",
        description: "Cây anh đào đang lớn dần", sparkles: "✨"
      }
    }
    if (flower === "sunflower") {
      if (points >= 1200) return { 
        level: 4, name: "Hướng Dương Nở Rộ", emoji: emojis[3], color: "from-yellow-400 to-orange-500",
        description: "Hoa hướng dương vàng rực rỡ như mặt trời", sparkles: "✨✨✨"
      }
      if (points >= 700) return { 
        level: 3, name: "Hướng Dương Sắp Nở", emoji: emojis[2], color: "from-green-400 to-yellow-400",
        description: "Hoa hướng dương sắp nở vàng tươi", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Hướng Dương", emoji: emojis[0], color: "from-green-300 to-yellow-300",
        description: "Mầm hướng dương đang cao lớn", sparkles: "✨"
      }
    }
    if (flower === "tulip") {
      if (points >= 1200) return { 
        level: 4, name: "Tulip Nở Rộ", emoji: emojis[3], color: "from-purple-400 to-pink-500",
        description: "Tulip nở đầy màu sắc - tình yêu hoàn mỹ", sparkles: "✨✨✨"
      }
      if (points >= 700) return { 
        level: 3, name: "Tulip Đang Nở", emoji: emojis[2], color: "from-pink-300 to-purple-400",
        description: "Tulip đang từ từ hé nở", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Tulip", emoji: emojis[0], color: "from-green-300 to-purple-300",
        description: "Mầm tulip đang lớn lên", sparkles: "✨"
      }
    }
    if (flower === "lavender") {
      if (points >= 1200) return { 
        level: 4, name: "Oải Hương Nở Rộ", emoji: emojis[3], color: "from-purple-500 to-indigo-600",
        description: "Đồng hoa oải hương tím ngát hương", sparkles: "✨✨✨"
      }
      if (points >= 700) return { 
        level: 3, name: "Oải Hương Đang Nở", emoji: emojis[2], color: "from-indigo-400 to-purple-500",
        description: "Những bông hoa oải hương đầu tiên", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Oải Hương", emoji: emojis[0], color: "from-green-300 to-indigo-300",
        description: "Mầm oải hương đang phát triển", sparkles: "✨"
      }
    }
    if (flower === "jasmine") {
      if (points >= 700) return { 
        level: 4, name: "Nhài Nở Rộ", emoji: emojis[3], color: "from-gray-100 to-white",
        description: "Hoa nhài trắng ngần tỏa hương thơm", sparkles: "✨✨✨"
      }
      if (points >= 300) return { 
        level: 3, name: "Nhài Đang Nở", emoji: emojis[2], color: "from-green-200 to-white",
        description: "Những bông hoa nhài trắng đầu tiên", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Nhài", emoji: emojis[0], color: "from-green-300 to-gray-200",
        description: "Mầm hoa nhài đang lớn dần", sparkles: "✨"
      }
    }
    if (flower === "orchid") {
      if (points >= 2000) return { 
        level: 4, name: "Lan Nở Rộ", emoji: emojis[3], color: "from-purple-600 to-pink-400",
        description: "Hoa lan quý phái nở rộ - sự sang trọng và quý phái", sparkles: "✨✨✨"
      }
      if (points >= 1200) return { 
        level: 3, name: "Lan Đang Nở", emoji: emojis[2], color: "from-purple-500 to-pink-300",
        description: "Những bông lan đầu tiên hé nở", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Lan", emoji: emojis[0], color: "from-green-300 to-purple-300",
        description: "Mầm hoa lan đang phát triển", sparkles: "✨"
      }
    }
    if (flower === "lotus") {
      if (points >= 2200) return { 
        level: 4, name: "Sen Nở Rộ", emoji: emojis[3], color: "from-pink-500 to-rose-600",
        description: "Hoa sen thanh khiết nở rộ trên mặt nước", sparkles: "✨✨✨"
      }
      if (points >= 1400) return { 
        level: 3, name: "Sen Đang Nở", emoji: emojis[2], color: "from-pink-400 to-rose-500",
        description: "Những bông sen đầu tiên nổi trên mặt nước", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Sen", emoji: emojis[0], color: "from-green-300 to-pink-300",
        description: "Mầm sen đang lớn dần", sparkles: "✨"
      }
    }
    if (flower === "peony") {
      if (points >= 2200) return { 
        level: 4, name: "Mẫu Đơn Nở Rộ", emoji: emojis[3], color: "from-pink-600 to-red-500",
        description: "Hoa mẫu đơn nở rộ - vẻ đẹp và thịnh vượng", sparkles: "✨✨✨"
      }
      if (points >= 1400) return { 
        level: 3, name: "Mẫu Đơn Đang Nở", emoji: emojis[2], color: "from-pink-500 to-red-400",
        description: "Những cánh hoa mẫu đơn đầu tiên", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Mẫu Đơn", emoji: emojis[0], color: "from-green-300 to-pink-400",
        description: "Mầm hoa mẫu đơn đang phát triển", sparkles: "✨"
      }
    }
    if (flower === "rose-gold") {
      if (points >= 2500) return { 
        level: 4, name: "Hồng Vàng Nở Rộ", emoji: emojis[3], color: "from-yellow-500 via-amber-500 to-orange-500",
        description: "Hoa hồng vàng rực rỡ - tình bạn và niềm vui", sparkles: "✨✨✨"
      }
      if (points >= 1600) return { 
        level: 3, name: "Hồng Vàng Đang Nở", emoji: emojis[2], color: "from-yellow-400 to-orange-400",
        description: "Những bông hồng vàng đầu tiên", sparkles: "✨✨"
      }
      return { 
        level: 2, name: "Mầm Hồng Vàng", emoji: emojis[0], color: "from-green-300 to-yellow-300",
        description: "Mầm hoa hồng vàng đang lớn dần", sparkles: "✨"
      }
    }
    if (flower === "eternal-rose") {
      if (points >= 2500) return { 
        level: 4, name: "Hồng Vĩnh Cửu Nở Rộ", emoji: emojis[3], color: "from-rose-700 via-pink-700 to-purple-700",
        description: "Hoa hồng vĩnh cửu - tình yêu bất diệt và vĩnh hằng", sparkles: "✨✨✨✨"
      }
      if (points >= 1600) return { 
        level: 3, name: "Hồng Vĩnh Cửu Đang Nở", emoji: emojis[2], color: "from-rose-600 to-purple-600",
        description: "Những bông hồng vĩnh cửu đầu tiên tỏa sáng", sparkles: "✨✨✨"
      }
      return { 
        level: 2, name: "Mầm Hồng Vĩnh Cửu", emoji: emojis[0], color: "from-green-300 to-rose-400",
        description: "Mầm hoa hồng vĩnh cửu đang phát triển", sparkles: "✨✨"
      }
    }

    // Default levels - độ khó thấp hơn
    if (points >= 500) return { 
      level: 4, name: "Vườn hoa đầy hoa", emoji: "🌼", 
      color: "from-yellow-300 to-pink-400",
      description: "Vườn hoa nở rộ đầy màu sắc", sparkles: "✨✨✨"
    }
    if (points >= 200) return { 
      level: 3, name: "Cây đang ra hoa", emoji: "🌺", 
      color: "from-pink-300 to-rose-400",
      description: "Cây bắt đầu nở những bông hoa đầu tiên", sparkles: "✨"
    }
    if (points >= 100) return { 
      level: 2, name: "Mầm hoa", emoji: "🌱", 
      color: "from-green-300 to-green-500",
      description: "Mầm cây bắt đầu mọc và lớn dần", sparkles: ""
    }
    return { 
      level: 1, name: "Hạt giống", emoji: "🌰", 
      color: "from-amber-400 to-orange-500",
      description: "Hạt giống vừa được gieo xuống", sparkles: ""
    }
  }

  const getProgressToNext = (points: number) => {
    // Giảm thresholds: 0, 100, 200, 500
    const thresholds = [0, 100, 200, 500]
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (points >= thresholds[i]) {
        const nextLevel = thresholds[i + 1] || 500
        const progress = ((points - thresholds[i]) / (nextLevel - thresholds[i])) * 100
        return { current: thresholds[i], next: nextLevel, progress: Math.min(100, progress) }
      }
    }
    return { current: 0, next: 100, progress: 0 }
  }
  
  const treeLevel = getTreeLevel(totalPoints, currentFlower)
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
        <h3 className="text-lg font-bold text-pink-600">Vườn Tình Yêu</h3>
      </div>

      {/* Tree Visual */}
      <div className="relative flex items-end justify-center mb-6 bg-gradient-to-b from-sky-50 to-green-50 rounded-xl p-8" style={{ height: '220px' }}>
              {/* Sparkles effect for high levels */}
      {treeLevel.level >= 3 && (
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
              y: treeLevel.level >= 4 ? [0, -5, 0] : 0
            }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-center relative z-10"
        >
          <div className={`text-9xl mb-3 ${treeLevel.level >= 3 ? 'animate-pulse' : ''} filter drop-shadow-lg`}>
            {treeLevel.emoji}
          </div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-bold text-gray-800 mb-1"
          >
            {treeLevel.name}
          </motion.div>
          <div className="text-xs text-gray-600">Cấp độ {treeLevel.level}/4</div>
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
      {treeLevel.level === 4 && (
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
