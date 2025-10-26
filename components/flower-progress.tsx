"use client"

import { motion } from "framer-motion"
import { Trophy } from "lucide-react"

interface FlowerProgressProps {
  totalPoints: number
  flowerPrice: number
  currentStage: number
  onClaimReward?: (coins: number) => void
  claimedStages?: number[]
}

const getDifficulty = (price: number) => {
  if (price >= 200) return { 
    level: "Rất Khó", 
    thresholds: [0, 300, 600, 1000], 
    rewards: [50, 150, 400] // Coins for each stage
  }
  if (price >= 150) return { 
    level: "Khó", 
    thresholds: [0, 200, 500, 800],
    rewards: [30, 100, 250]
  }
  return { 
    level: "Dễ", 
    thresholds: [0, 100, 200, 500],
    rewards: [20, 60, 150]
  }
}

export default function FlowerProgress({ totalPoints, flowerPrice, currentStage, onClaimReward, claimedStages = [] }: FlowerProgressProps) {
  const difficulty = getDifficulty(flowerPrice)
  const thresholds = difficulty.thresholds
  const rewards = difficulty.rewards

  // Find current stage and next threshold
  let currentThreshold = 0
  let nextThreshold = thresholds[1]
  let stageName = "Mầm Non"
  let reward = 0
  let stageIndex = 0

  if (totalPoints >= thresholds[3]) {
    currentThreshold = thresholds[3]
    nextThreshold = 0 // Max level
    stageName = "Nở Rộ"
    reward = rewards[2]
    stageIndex = 3
  } else if (totalPoints >= thresholds[2]) {
    currentThreshold = thresholds[2]
    nextThreshold = thresholds[3]
    stageName = "Chớm Nở"
    reward = rewards[1]
    stageIndex = 2
  } else if (totalPoints >= thresholds[1]) {
    currentThreshold = thresholds[1]
    nextThreshold = thresholds[2]
    stageName = "Phát Triển"
    reward = rewards[0]
    stageIndex = 1
  }

  const progress = nextThreshold > 0 
    ? ((totalPoints - currentThreshold) / (nextThreshold - currentThreshold)) * 100 
    : 100

  const pointsNeeded = nextThreshold > 0 ? nextThreshold - totalPoints : 0

  // Check if can claim reward (reached threshold and not claimed yet)
  const canClaimReward = totalPoints >= currentThreshold && !claimedStages.includes(stageIndex) && currentThreshold > 0

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-yellow-600" />
        <h3 className="text-lg font-bold text-yellow-600">Tiến Độ Phát Triển</h3>
      </div>

      <div className="space-y-4">
        {/* Current Stage */}
        <div className="bg-white rounded-xl p-4 border border-yellow-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Giai đoạn hiện tại</span>
            <span className="text-lg font-bold text-yellow-600">{stageName}</span>
          </div>
          {nextThreshold > 0 && (
            <div className="text-xs text-gray-500">
              Cần thêm <span className="font-bold text-orange-500">{pointsNeeded}</span> điểm để đến giai đoạn tiếp theo
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {nextThreshold > 0 && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Tiến độ</span>
              <span className="font-semibold text-yellow-600">{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
                className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{currentThreshold} điểm</span>
              <span>{nextThreshold} điểm</span>
            </div>
          </div>
        )}

        {/* Reward Info */}
        {nextThreshold > 0 && (
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl p-4 border border-yellow-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🏆</span>
              <span className="font-semibold text-gray-800">Thưởng xu</span>
            </div>
            <div className="text-sm text-gray-700 mb-3">
              Hoàn thành giai đoạn này để nhận <span className="font-bold text-orange-600">{reward} xu</span>!
            </div>
            {canClaimReward && onClaimReward ? (
              <button
                onClick={() => onClaimReward(reward)}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-2 rounded-lg font-bold text-sm hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg"
              >
                🎁 Nhận {reward} Xu
              </button>
            ) : claimedStages.includes(stageIndex) ? (
              <div className="text-center text-sm font-semibold text-green-600">
                ✓ Đã nhận thưởng
              </div>
            ) : (
              <div className="text-xs text-gray-600">
                💡 Hoa càng khó, thưởng xu càng lớn! Dùng xu để mua hoa đắt hơn! ✨
              </div>
            )}
          </div>
        )}

        {/* Max Level Celebration */}
        {nextThreshold === 0 && (
          <div className="bg-gradient-to-r from-yellow-200 via-orange-200 to-red-200 rounded-xl p-4 border-2 border-yellow-400">
            <div className="text-center">
              <div className="text-3xl mb-2">🎉🌈✨</div>
              <div className="font-bold text-gray-800 mb-1">Chúc mừng!</div>
              <div className="text-sm text-gray-700">
                Bạn đã hoàn thành tất cả giai đoạn và nhận được <span className="font-bold text-yellow-600">{reward} xu</span>!
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
