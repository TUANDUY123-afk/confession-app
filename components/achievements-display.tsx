"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Zap, Crown, Gift, Target, TrendingUp, Award as AwardIcon } from "lucide-react"

interface AchievementLevel {
  target: number
  reward: number
  label: string
  levelIndex?: number
  isUnlocked?: boolean
  isClaimed?: boolean
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
  pendingReward?: number
  claimedLevels?: number[]
}

const achievementCategories = {
  daily_diary: { color: "purple", gradient: "from-purple-500 to-pink-500", icon: "📝" },
  like_master: { color: "red", gradient: "from-red-500 to-pink-500", icon: "❤️" },
  comment_king: { color: "blue", gradient: "from-blue-500 to-cyan-500", icon: "💬" },
  photo_collector: { color: "green", gradient: "from-green-500 to-emerald-500", icon: "📸" },
  love_garden_bloom: { color: "yellow", gradient: "from-yellow-400 to-orange-500", icon: "🌺" },
}

export default function AchievementsDisplay() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null) // Track which achievement is being claimed

  useEffect(() => {
    fetchAchievements()
    // Auto-refresh every 10 seconds (more frequent for better UX)
    const interval = setInterval(fetchAchievements, 10000)
    return () => clearInterval(interval)
  }, [])
  
  // Also refresh when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchAchievements()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/gamification/achievements", { 
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      const data = await res.json()
      if (Array.isArray(data)) {
        setAchievements(data)
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
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 border-2 border-purple-200 shadow-2xl">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const totalUnlockedLevels = achievements.reduce((sum, a) => {
    return sum + (a.levelsStatus?.filter(l => l.isUnlocked).length || 0)
  }, 0)
  const totalPossibleLevels = achievements.reduce((sum, a) => sum + a.totalLevels, 0)
  const completionRate = totalPossibleLevels > 0 ? (totalUnlockedLevels / totalPossibleLevels) * 100 : 0
  const unlockedAchievements = achievements.filter(a => a.levelsStatus?.some(l => l.isUnlocked))
  const fullyCompletedAchievements = achievements.filter(a => 
    a.levelsStatus?.every(l => l.isUnlocked)
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 md:p-8 border-2 border-purple-200/50 shadow-2xl relative overflow-hidden"
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div 
                          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl"
                          animate={{ opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                        <motion.div 
                          className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br from-yellow-300/20 to-orange-300/20 rounded-full blur-3xl"
                          animate={{ opacity: [0.2, 0.4, 0.2] }}
                          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                        />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-lg">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                    Thành Tích
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Mở khóa để nhận phần thưởng nước</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-3 flex-wrap">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 flex-1 min-w-[120px]">
                <div className="text-2xl font-bold text-purple-600">{totalUnlockedLevels}</div>
                <div className="text-xs text-gray-600">/{totalPossibleLevels} cấp độ</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-200 flex-1 min-w-[120px]">
                <div className="text-2xl font-bold text-orange-600">{unlockedAchievements.length}</div>
                <div className="text-xs text-gray-600">/{achievements.length} thành tích</div>
              </div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-purple-200/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-gray-700">Tiến độ tổng thể</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {completionRate.toFixed(0)}%
              </span>
            </div>
            <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full relative"
              >
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                />
              </motion.div>
            </div>
            {fullyCompletedAchievements.length > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                <Crown className="w-4 h-4" />
                <span className="font-semibold">{fullyCompletedAchievements.length} thành tích đã hoàn thành!</span>
              </div>
            )}
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <AnimatePresence>
            {achievements.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-2 text-center py-16"
              >
                <div className="text-6xl mb-4">🎯</div>
                <p className="text-xl font-semibold text-gray-700 mb-2">Chưa có thành tích nào</p>
                <p className="text-gray-500">Bắt đầu hoạt động để mở khóa thành tích đầu tiên!</p>
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
                const isFullyCompleted = levelsStatus.every(l => l.isUnlocked)
                const category = achievementCategories[achievement.type as keyof typeof achievementCategories] || {
                  color: "gray",
                  gradient: "from-gray-500 to-gray-600",
                  icon: "⭐"
                }
                const unlockedCount = levelsStatus.filter(l => l.isUnlocked).length

                return (
                  <motion.div
                    key={achievement.type}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                      isFullyCompleted
                        ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 border-yellow-400 shadow-xl'
                        : hasAnyUnlocked
                        ? 'bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 border-purple-300 shadow-lg'
                        : 'bg-white/80 backdrop-blur-sm border-gray-200 shadow-md'
                    }`}
                    onClick={() => setSelectedAchievement(
                      selectedAchievement === achievement.type ? null : achievement.type
                    )}
                  >
                    {/* Glow effect for unlocked */}
                    {hasAnyUnlocked && (
                      <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 blur-xl pointer-events-none`}
                      />
                    )}

                    <div className="relative p-6">
                      {/* Achievement Header */}
                      <div className="flex items-start gap-4 mb-4">
                        {/* Icon */}
                        <div className={`relative flex-shrink-0 ${hasAnyUnlocked ? 'animate-bounce' : ''}`}>
                          <div className={`text-5xl p-4 rounded-2xl transition-all shadow-lg ${
                            isFullyCompleted
                              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 scale-110'
                              : hasAnyUnlocked
                              ? `bg-gradient-to-br ${category.gradient}`
                              : 'bg-gray-200 opacity-50'
                          }`}>
                            {achievement.icon}
                          </div>
                          {isFullyCompleted && (
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                              className="absolute -top-2 -right-2"
                            >
                              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                            </motion.div>
                          )}
                        </div>

                        {/* Title and Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className={`text-xl font-bold ${
                              hasAnyUnlocked
                                ? `bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent`
                                : 'text-gray-700'
                            }`}>
                              {achievement.name}
                            </h3>
                            {isFullyCompleted && (
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-1 text-xs">
                              <Target className="w-4 h-4 text-purple-500" />
                              <span className="font-semibold text-gray-700">
                                {achievement.progress}/{maxTarget}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <AwardIcon className="w-4 h-4 text-yellow-500" />
                              <span className="font-semibold text-gray-700">
                                {unlockedCount}/{achievement.totalLevels} cấp độ
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(achievement.progress / maxTarget) * 100}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                            className={`h-full bg-gradient-to-r ${category.gradient} rounded-full`}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">Tiến độ</span>
                          <span className="text-xs font-semibold text-gray-700">
                            {((achievement.progress / maxTarget) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {/* Level Badges */}
                      <div className="flex gap-2 flex-wrap mb-4">
                        {achievement.levels.map((level, levelIndex) => {
                          const isUnlocked = levelsStatus[levelIndex]?.isUnlocked || false
                          const isClaimed = levelsStatus[levelIndex]?.isClaimed || false
                          return (
                            <div
                              key={levelIndex}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isClaimed
                                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md'
                                  : isUnlocked
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {isClaimed ? (
                                <Star className="w-3 h-3 fill-white" />
                              ) : isUnlocked ? (
                                <Zap className="w-3 h-3" />
                              ) : (
                                <Target className="w-3 h-3" />
                              )}
                              <span>{level.target}</span>
                              {isUnlocked && !isClaimed && (
                                <Gift className="w-3 h-3 animate-pulse" />
                              )}
                            </div>
                          )
                        })}
                      </div>

                      {/* Claim Reward Button */}
                      {achievement.pendingReward && achievement.pendingReward > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4"
                        >
                          <button
                            disabled={claiming === achievement.type}
                            onClick={async () => {
                              if (claiming === achievement.type) return // Prevent double click
                              
                              setClaiming(achievement.type)
                              try {
                                const res = await fetch("/api/gamification/achievements/claim", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ achievement_type: achievement.type }),
                                })
                                const data = await res.json()
                                if (res.ok) {
                                  // Immediately refresh achievements and wait for it to complete
                                  await fetchAchievements()
                                  // Small delay to ensure state updates
                                  setTimeout(() => {
                                    setClaiming(null)
                                  }, 100)
                                } else {
                                  // If error is "No rewards available", just refresh silently (button will disappear)
                                  if (data.error && data.error.includes("No rewards available")) {
                                    await fetchAchievements()
                                    setClaiming(null)
                                  } else {
                                    alert(data.error || "Không thể nhận thưởng")
                                    setClaiming(null)
                                  }
                                }
                              } catch (err) {
                                console.error("Error claiming reward:", err)
                                alert("Có lỗi xảy ra khi nhận thưởng")
                                setClaiming(null)
                              }
                            }}
                            className={`w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                              claiming === achievement.type
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                            }`}
                          >
                            {claiming === achievement.type ? (
                              '⏳ Đang nhận...'
                            ) : (
                              `🎁 Nhận ${achievement.pendingReward} Nước`
                            )}
                          </button>
                        </motion.div>
                      )}

                      {/* Next Level Info (if expanded) */}
                      {selectedAchievement === achievement.type && achievement.nextLevel && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-200"
                        >
                          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full border-2 border-blue-400 bg-blue-100 flex items-center justify-center">
                                  <span className="text-xs font-bold text-blue-600">
                                    {achievement.currentLevelIndex + 2}
                                  </span>
                                </div>
                                <span className="font-semibold text-blue-700">
                                  {achievement.nextLevel.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold">
                                <Gift className="w-3 h-3" />
                                <span>+{achievement.nextLevel.reward} nước</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              Cần thêm {achievement.nextLevel.target - achievement.progress} để mở khóa
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>

        {/* Completion Celebration */}
        {completionRate === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 text-center p-8 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 rounded-3xl shadow-2xl text-white"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">Chúc mừng bạn!</h3>
            <p className="text-lg opacity-90">Bạn đã mở khóa TẤT CẢ thành tích!</p>
            <p className="text-sm opacity-80 mt-2">Thật tuyệt vời! 🌟</p>
          </motion.div>
        )}

        {/* Encouragement Message */}
        {completionRate < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center p-6 bg-gradient-to-r from-purple-100/80 via-pink-100/80 to-rose-100/80 backdrop-blur-sm rounded-2xl border-2 border-purple-200/50"
          >
            <p className="text-lg font-semibold text-gray-700 mb-2">
              💪 Tiếp tục cố gắng!
            </p>
            <p className="text-sm text-gray-600">
              Mỗi thành tích mở khóa sẽ mang lại phần thưởng nước hấp dẫn. Hãy kiên trì nhé!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
