"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Award, Lock } from "lucide-react"

interface Achievement {
  type: string
  name: string
  description: string
  icon: string
  target: number
  points_reward: number
  progress: number
  unlocked: boolean
  unlocked_at?: string
}

export default function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/gamification/achievements", { cache: 'force-cache' })
      const data = await res.json()
      setAchievements(data)
    } catch (err) {
      console.error("Error fetching achievements:", err)
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

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const progress = (unlockedCount / achievements.length) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <Award className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="text-lg font-bold text-pink-600">🏆 Thành Tích</h3>
        <span className="ml-auto text-sm text-gray-600">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Progress Overview */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Tiến độ tổng thể</span>
          <span className="font-semibold text-pink-600">{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500"
          />
        </div>
      </div>

      {/* Achievements List */}
      <div className="space-y-3">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white/80 backdrop-blur-sm rounded-xl p-4 border transition-all ${
              achievement.unlocked
                ? 'border-yellow-300 shadow-md'
                : 'border-pink-100'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`text-3xl ${achievement.unlocked ? '' : 'opacity-30 grayscale'}`}>
                {achievement.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {achievement.name}
                      {achievement.unlocked && (
                        <span className="ml-2 text-yellow-500">✓</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Award className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                  )}
                  {!achievement.unlocked && (
                    <Lock className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Tiến độ</span>
                    <span>{achievement.progress}/{achievement.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        achievement.unlocked
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-pink-300 to-rose-400'
                      }`}
                    />
                  </div>
                </div>

                {/* Reward */}
                {achievement.unlocked && achievement.unlocked_at && (
                  <div className="mt-2 text-xs text-green-600 font-medium">
                    ✨ Đã mở khóa: {new Date(achievement.unlocked_at).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Encouragement */}
      {progress < 100 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-center text-sm text-gray-600 bg-white/60 rounded-lg p-3"
        >
          💪 Tiếp tục cố gắng để mở khóa tất cả thành tích!
        </motion.div>
      )}
    </motion.div>
  )
}
