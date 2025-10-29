"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Award, Lock, Sparkles, Droplet, CheckCircle2 } from "lucide-react"

interface AchievementLevel {
  target: number
  reward: number
  label: string
  levelIndex?: number
  isUnlocked?: boolean
}

interface Achievement {
  type: string
  name: string
  description: string
  icon: string
  progress: number
  levels: AchievementLevel[]
  levelsStatus?: AchievementLevel[]
  currentLevelIndex: number
  nextLevel: AchievementLevel | null
  totalLevels: number
}

export default function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/gamification/achievements", { 
        cache: 'no-store',
        next: { revalidate: 0 }
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setAchievements(data)
      } else if (data.error) {
        console.error("API error:", data.error)
        setAchievements([])
      } else {
        setAchievements([])
      }
    } catch (err) {
      console.error("Error fetching achievements:", err)
      setAchievements([])
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

  // Calculate total unlocked levels across all achievements
  const totalUnlockedLevels = achievements.reduce((sum, a) => {
    return sum + (a.levelsStatus?.filter(l => l.isUnlocked).length || 0)
  }, 0)
  const totalPossibleLevels = achievements.reduce((sum, a) => sum + a.totalLevels, 0)
  const progress = totalPossibleLevels > 0 ? (totalUnlockedLevels / totalPossibleLevels) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-3xl p-6 border-2 border-purple-100 shadow-xl relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-200/30 to-orange-200/30 rounded-full blur-3xl -z-0"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-2xl -z-0"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl shadow-lg">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🏆 Thành Tích
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Mở khóa để nhận phần thưởng nước</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-purple-200 shadow-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{totalUnlockedLevels}</div>
              <div className="text-xs text-gray-500">/{totalPossibleLevels} giai đoạn</div>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="mb-6 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-purple-100 shadow-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Tiến độ tổng thể</span>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-200/80 rounded-full h-3 overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-full shadow-sm relative"
            >
              {progress > 0 && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              )}
            </motion.div>
          </div>
        </div>

        {/* Achievements List */}
        <div className="space-y-4">
          <AnimatePresence>
            {achievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <div className="text-6xl mb-3">📋</div>
                <p className="text-lg">Chưa có thành tích nào</p>
              </motion.div>
            ) : (
              achievements.map((achievement, index) => {
                const levelsStatus = achievement.levelsStatus || achievement.levels.map((l, i) => ({
                  ...l,
                  levelIndex: i,
                  isUnlocked: achievement.progress >= l.target
                }))
                const maxTarget = Math.max(...achievement.levels.map(l => l.target))
                const hasAnyUnlocked = levelsStatus.some(l => l.isUnlocked)
                
                return (
                  <motion.div
                    key={achievement.type}
                    initial={{ opacity: 0, x: -20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: index * 0.08, type: "spring", stiffness: 100 }}
                    className={`group relative overflow-hidden rounded-2xl p-5 border-2 transition-all duration-300 ${
                      hasAnyUnlocked
                        ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-yellow-300 shadow-lg hover:shadow-xl'
                        : 'bg-white/70 backdrop-blur-sm border-purple-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {/* Shine effect */}
                    {hasAnyUnlocked && (
                      <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                      />
                    )}
                    
                    <div className="relative">
                      {/* Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Icon */}
                        <div className={`relative flex-shrink-0 ${
                          hasAnyUnlocked ? 'animate-pulse' : ''
                        }`}>
                          <div className={`text-5xl p-3 rounded-2xl transition-all ${
                            hasAnyUnlocked
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg'
                              : 'bg-gray-100 opacity-50'
                          }`}>
                            {achievement.icon}
                          </div>
                          {hasAnyUnlocked && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -top-1 -right-1"
                            >
                              <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            </motion.div>
                          )}
                        </div>

                        {/* Title */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`text-lg font-bold ${
                              hasAnyUnlocked
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent'
                                : 'text-gray-700'
                            }`}>
                              {achievement.name}
                            </h4>
                            {hasAnyUnlocked && (
                              <Award className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            Tiến độ: <span className="font-semibold text-purple-600">{achievement.progress}/{maxTarget}</span>
                          </div>
                        </div>
                      </div>

                      {/* Unified Progress Bar */}
                      <div className="space-y-4">
                        {/* Single Progress Bar */}
                        <div className="relative">
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                            {achievement.levels.map((level, levelIndex) => {
                              const isUnlocked = levelsStatus[levelIndex]?.isUnlocked || false
                              const prevTarget = levelIndex > 0 ? achievement.levels[levelIndex - 1].target : 0
                              const segmentWidth = ((level.target - prevTarget) / maxTarget) * 100
                              const segmentStart = (prevTarget / maxTarget) * 100
                              
                              // Calculate progress within this segment
                              let segmentProgress = 0
                              if (achievement.progress >= level.target) {
                                segmentProgress = 100 // Fully completed
                              } else if (achievement.progress > prevTarget) {
                                segmentProgress = ((achievement.progress - prevTarget) / (level.target - prevTarget)) * 100
                              }
                              
                              return (
                                <div
                                  key={levelIndex}
                                  className="absolute h-full left-0"
                                  style={{
                                    left: `${segmentStart}%`,
                                    width: `${segmentWidth}%`,
                                  }}
                                >
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${segmentProgress}%` }}
                                    transition={{ duration: 0.8, delay: (index * 0.1) + (levelIndex * 0.05) }}
                                    className={`h-full ${
                                      isUnlocked
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                        : 'bg-gradient-to-r from-blue-400 to-cyan-500'
                                    }`}
                                  />
                                </div>
                              )
                            })}
                          </div>
                          
                          {/* Level markers */}
                          <div className="relative mt-1">
                            {achievement.levels.map((level, levelIndex) => {
                              const isUnlocked = levelsStatus[levelIndex]?.isUnlocked || false
                              const position = (level.target / maxTarget) * 100
                              
                              return (
                                <div
                                  key={levelIndex}
                                  className="absolute -top-4 transform -translate-x-1/2"
                                  style={{ left: `${position}%` }}
                                >
                                  {isUnlocked && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 fill-green-500" />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Current and Next Level Display */}
                        <div className="space-y-2">
                          {/* Completed Levels */}
                          {levelsStatus
                            .filter(l => l.isUnlocked)
                            .map((level, idx) => (
                              <motion.div
                                key={level.levelIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl"
                              >
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-green-500 fill-green-500" />
                                  <span className="text-sm font-semibold text-green-700">
                                    {level.label}
                                  </span>
                                  <span className="text-xs text-green-600">
                                    ({level.target})
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                                  <Droplet className="w-3 h-3" />
                                  <span>+{level.reward} nước</span>
                                </div>
                              </motion.div>
                            ))}
                          
                          {/* Next/Current Level - only show one */}
                          {achievement.nextLevel && (() => {
                            const currentLevelTarget = achievement.currentLevelIndex >= 0 
                              ? achievement.levels[achievement.currentLevelIndex]?.target || 0 
                              : 0
                            const nextLevelTarget = achievement.nextLevel.target
                            const progressInSegment = Math.max(0, achievement.progress - currentLevelTarget)
                            const segmentSize = nextLevelTarget - currentLevelTarget
                            const progressPercent = segmentSize > 0 ? Math.min(100, (progressInSegment / segmentSize) * 100) : 0
                            
                            return (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full border-2 border-blue-400 bg-blue-100" />
                                    <span className="text-sm font-semibold text-blue-700">
                                      {achievement.nextLevel.label}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                      ({achievement.nextLevel.target})
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-sm">
                                    <Droplet className="w-3 h-3" />
                                    <span>+{achievement.nextLevel.reward} nước</span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ duration: 0.8 }}
                                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                                  />
                                </div>
                                <div className="mt-1 text-xs text-gray-600 text-center">
                                  {Math.max(0, achievement.progress - currentLevelTarget)}/{segmentSize} (đến {nextLevelTarget})
                                </div>
                              </motion.div>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Encouragement */}
        {progress < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center p-4 bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm rounded-2xl border border-purple-200 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-700 mb-1">
              💪 Tiếp tục cố gắng để mở khóa tất cả thành tích!
            </p>
            <p className="text-xs text-gray-500">
              Mỗi thành tích sẽ mang lại phần thưởng nước hấp dẫn
            </p>
          </motion.div>
        )}
        
        {progress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 text-center p-5 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-2xl shadow-xl text-white"
          >
            <div className="text-4xl mb-2">🎉</div>
            <p className="text-lg font-bold mb-1">Chúc mừng!</p>
            <p className="text-sm opacity-90">Bạn đã mở khóa tất cả thành tích!</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
