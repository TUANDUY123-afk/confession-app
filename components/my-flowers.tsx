"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Flower } from "lucide-react"

interface Flower {
  id: string
  name: string
  emoji: string
  price: number
  gradient: string
}

interface MyFlowersProps {
  ownedFlowers: string[]
  totalPoints: number
  onSelectFlower: (flowerId: string) => void
  onWaterFlower?: (flowerId: string, waterAmount: number) => void
  currentWater: number
  onWaterConsumed?: (amount: number) => void
}

const FLOWERS: { [key: string]: Flower } = {
  rose: {
    id: "rose",
    name: "Hoa Hồng",
    emoji: "🌹",
    price: 150,
    gradient: "from-red-500 to-pink-600"
  },
  tulip: {
    id: "tulip",
    name: "Hoa Tulip",
    emoji: "🌷",
    price: 180,
    gradient: "from-purple-400 to-pink-500"
  },
  sunflower: {
    id: "sunflower",
    name: "Hoa Hướng Dương",
    emoji: "🌻",
    price: 220,
    gradient: "from-yellow-400 to-orange-500"
  },
  jasmine: {
    id: "jasmine",
    name: "Hoa Nhài",
    emoji: "🤍",
    price: 240,
    gradient: "from-gray-100 to-white"
  },
  lavender: {
    id: "lavender",
    name: "Hoa Oải Hương",
    emoji: "🪻",
    price: 270,
    gradient: "from-purple-500 to-indigo-600"
  },
  cherry: {
    id: "cherry",
    name: "Hoa Anh Đào",
    emoji: "🌸",
    price: 300,
    gradient: "from-pink-400 to-rose-500"
  },
  orchid: {
    id: "orchid",
    name: "Hoa Lan",
    emoji: "🦋",
    price: 350,
    gradient: "from-purple-600 to-pink-400"
  },
  lotus: {
    id: "lotus",
    name: "Hoa Sen",
    emoji: "🪷",
    price: 400,
    gradient: "from-pink-500 to-rose-600"
  },
  peony: {
    id: "peony",
    name: "Hoa Mẫu Đơn",
    emoji: "🌺",
    price: 500,
    gradient: "from-pink-600 to-red-500"
  },
  "rose-gold": {
    id: "rose-gold",
    name: "Hoa Hồng Vàng",
    emoji: "🌼",
    price: 600,
    gradient: "from-yellow-500 via-amber-500 to-orange-500"
  },
  "eternal-rose": {
    id: "eternal-rose",
    name: "Hoa Hồng Vĩnh Cửu",
    emoji: "💎",
    price: 800,
    gradient: "from-rose-700 via-pink-700 to-purple-700"
  }
}

// Define difficulty levels based on price
const getDifficulty = (price: number) => {
  if (price >= 600) return { level: "Cực Khó", thresholds: [0, 800, 1600, 2500], color: "text-purple-900" }
  if (price >= 400) return { level: "Siêu Khó", thresholds: [0, 700, 1400, 2200], color: "text-purple-700" }
  if (price >= 300) return { level: "Rất Khó", thresholds: [0, 600, 1200, 2000], color: "text-purple-600" }
  if (price >= 200) return { level: "Khó", thresholds: [0, 500, 1000, 1500], color: "text-red-600" }
  return { level: "Dễ", thresholds: [0, 300, 700, 1200], color: "text-green-600" }
}

export default function MyFlowers({ ownedFlowers, totalPoints, onSelectFlower, onWaterFlower, currentWater, onWaterConsumed }: MyFlowersProps) {
  const [flowerWaterData, setFlowerWaterData] = useState<{ [key: string]: number }>({})
  const [pendingSync, setPendingSync] = useState<{ [key: string]: number }>({})
  const [syncTimeouts, setSyncTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [localWater, setLocalWater] = useState(currentWater)
  const [isOnline, setIsOnline] = useState(true)
  const [globalSyncTimeout, setGlobalSyncTimeout] = useState<NodeJS.Timeout | null>(null)
  const [waterToDeduct, setWaterToDeduct] = useState(0)
  const PENDING_SYNC_KEY = 'pending_water_sync'

  // Sync local water with parent ONLY when component mounts
  // Don't sync automatically on every currentWater change to prevent race conditions
  useEffect(() => {
    console.log("🏗️ MyFlowers mounted, initializing localWater with:", currentWater)
    setLocalWater(currentWater)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run on mount
  
  // Sync when currentWater increases (e.g., test buttons, but not during watering)
  useEffect(() => {
    if (currentWater > localWater) {
      // Only sync if currentWater is higher (meaning water was added externally)
      console.log("💧 External water added, syncing:", { currentWater, localWater })
      setLocalWater(currentWater)
    } else if (currentWater !== localWater) {
      console.log("⚠️ Water mismatch but not syncing to prevent race:", { currentWater, localWater })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWater]) // Sync when water increases externally

  // Handle water deduction in a separate effect
  useEffect(() => {
    if (waterToDeduct > 0) {
      setLocalWater(prev => {
        const newWater = Math.max(0, prev - waterToDeduct)
        console.log(`Deducted ${waterToDeduct} water, new total: ${newWater}`)
        return newWater
      })
      
      // Notify parent
      if (onWaterConsumed) {
        onWaterConsumed(waterToDeduct)
      }
      
      // Reset
      setWaterToDeduct(0)
    }
  }, [waterToDeduct, onWaterConsumed])

  // Load pending syncs from localStorage on mount
  useEffect(() => {
    const loadPendingSyncs = () => {
      try {
        const stored = localStorage.getItem(PENDING_SYNC_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log("Loaded pending syncs from localStorage:", parsed)
          setPendingSync(parsed)
        }
      } catch (err) {
        console.error("Error loading pending syncs:", err)
      }
    }
    loadPendingSyncs()
  }, [])

  // Save pending syncs to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(pendingSync).length > 0) {
      try {
        localStorage.setItem(PENDING_SYNC_KEY, JSON.stringify(pendingSync))
        console.log("Saved pending syncs to localStorage:", pendingSync)
      } catch (err) {
        console.error("Error saving pending syncs:", err)
      }
    } else {
      // Clear localStorage when no pending syncs
      localStorage.removeItem(PENDING_SYNC_KEY)
    }
  }, [pendingSync])

  // Retry sync for pending items when component mounts
  useEffect(() => {
    const retryPendingSyncs = async () => {
      const pendingFlowerIds = Object.keys(pendingSync)
      if (pendingFlowerIds.length === 0 || !onWaterFlower) {
        return
      }

      console.log("Retrying pending syncs:", pendingFlowerIds)
      
      for (const flowerId of pendingFlowerIds) {
        const waterToAdd = pendingSync[flowerId]
        if (waterToAdd > 0) {
          try {
            console.log(`Retrying sync for ${flowerId} with ${waterToAdd} water...`)
            await onWaterFlower(flowerId, waterToAdd)
            
            // Clear pending sync after successful retry
            setPendingSync(prev => {
              const newPending = { ...prev }
              delete newPending[flowerId]
              return newPending
            })
            
            console.log(`✅ Successfully synced ${flowerId} on retry`)
          } catch (error) {
            console.error(`Failed to retry sync for ${flowerId}:`, error)
            // Keep in pending for next retry
          }
        }
      }
    }

    // Retry after a short delay to ensure component is fully mounted
    const timeout = setTimeout(retryPendingSyncs, 1000)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fetch flower water data
  useEffect(() => {
    const fetchFlowerWater = async () => {
      try {
        const res = await fetch("/api/gamification/flower-points")
        const data = await res.json()
        
        const waterMap: { [key: string]: number } = {}
        data.forEach((item: any) => {
          waterMap[item.flower_id] = item.points || 0
        })
        setFlowerWaterData(waterMap)
      } catch (err) {
        console.error("Error fetching flower water:", err)
      }
    }

    if (ownedFlowers.length > 0) {
      fetchFlowerWater()
    }
  }, [ownedFlowers, totalPoints])

  const handleWaterClick = (flowerId: string) => {
    // Calculate how much water is currently being synced
    const totalPendingAcrossAllFlowers = Object.values(pendingSync).reduce((sum, val) => sum + val, 0)
    const effectiveWater = localWater - totalPendingAcrossAllFlowers
    
    console.log("Water check:", {
      localWater,
      totalPendingAcrossAllFlowers,
      effectiveWater,
      canWater: effectiveWater >= 10
    })
    
    // Use effective water for the check
    if (effectiveWater < 10) {
      console.log("Not enough water to water (considering pending syncs)")
      return
    }

    // Get pending amount BEFORE adding to avoid race condition
    const currentPending = pendingSync[flowerId] || 0
    const newPending = currentPending + 10

    // Update UI immediately - add water to flower
    setFlowerWaterData(prev => ({
      ...prev,
      [flowerId]: (prev[flowerId] || 0) + 10
    }))

    // NOTE: Don't decrement water here - let the server handle it
    // Water will be deducted by the server when sync happens
    // This prevents race conditions where UI shows incorrect water amounts

        // Track pending sync
    setPendingSync(prev => ({
      ...prev,
      [flowerId]: newPending
    }))

    // Clear existing global sync timeout
    if (globalSyncTimeout) {
      clearTimeout(globalSyncTimeout)
    }

    // Set new global timeout to sync ALL flowers after user stops clicking for 1 second
    const timeout = setTimeout(() => {
      // Use callback pattern to get the latest pendingSync state
      setPendingSync(currentPendingSync => {
        const flowerIds = Object.keys(currentPendingSync)
        
        if (flowerIds.length > 0 && onWaterFlower) {
          console.log("Syncing all flowers with batched amounts:", currentPendingSync)
          
          // Sync all flowers one by one with batched amounts
          const syncPromises = flowerIds.map(async (flowerId) => {
            const waterToAdd = currentPendingSync[flowerId]
            if (waterToAdd > 0) {
              try {
                console.log(`Syncing batched ${waterToAdd} water to ${flowerId}...`)
                await onWaterFlower(flowerId, waterToAdd)
                
                console.log(`✅ Successfully synced ${waterToAdd} water to ${flowerId}`)
                return { flowerId, success: true }
              } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error'
                console.error(`Failed to sync ${flowerId}:`, errorMessage)
                return { flowerId, success: false }
              }
            }
            return { flowerId, success: true }
          })
          
          // Wait for all syncs to complete, then clear successful ones
          Promise.all(syncPromises).then(results => {
            setPendingSync(prev => {
              const newPending = { ...prev }
              let totalWaterDeducted = 0
              
              results.forEach(({ flowerId, success }) => {
                if (success) {
                  // Calculate total water deducted for successful syncs
                  totalWaterDeducted += currentPendingSync[flowerId] || 0
                  delete newPending[flowerId]
                }
              })
              
              // Update water deduction state (will trigger useEffect)
              if (totalWaterDeducted > 0) {
                setWaterToDeduct(totalWaterDeducted)
              }
              
              return newPending
            })
          })
        }
        
        return currentPendingSync
      })
    }, 1000) // 1 second delay for all flowers

    setGlobalSyncTimeout(timeout)
  }

  const getFlowerStage = (flower: Flower, points: number) => {
    const difficulty = getDifficulty(flower.price)
    const thresholds = difficulty.thresholds
    
    // Define stage emojis for each flower type
    const stageEmojis: { [key: string]: string[] } = {
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
    
    const emojis = stageEmojis[flower.id] || ["🌱", "🌿", "🌺", "🌹"]
    
    // Calculate progress similar to FlowerProgress component
    let currentThreshold = 0
    let nextThreshold = thresholds[1]
    let stageName = "Mầm Non"
    let stageIndex = 0
    
    if (points >= thresholds[3]) {
      currentThreshold = thresholds[3]
      nextThreshold = thresholds[3] // Max level - progress will be 100%
      stageName = "Nở Rộ"
      stageIndex = 3
    } else if (points >= thresholds[2]) {
      currentThreshold = thresholds[2]
      nextThreshold = thresholds[3]
      stageName = "Chớm Nở"
      stageIndex = 2
    } else if (points >= thresholds[1]) {
      currentThreshold = thresholds[1]
      nextThreshold = thresholds[2]
      stageName = "Phát Triển"
      stageIndex = 1
    } else {
      currentThreshold = thresholds[0]
      nextThreshold = thresholds[1]
      stageName = "Mầm Non"
      stageIndex = 0
    }
    
    // Calculate progress percentage - same logic as FlowerProgress component
    const progress = (nextThreshold > 0 && nextThreshold > currentThreshold)
      ? Math.max(0, Math.min(100, ((points - currentThreshold) / (nextThreshold - currentThreshold)) * 100))
      : points >= thresholds[3] ? 100 : 0
    
    // Map stage index to emoji and sparkles
    const stageMap: { [key: number]: { emoji: string, sparkles: string } } = {
      3: { emoji: emojis[3], sparkles: "✨✨✨" },
      2: { emoji: emojis[2], sparkles: "✨✨" },
      1: { emoji: emojis[1], sparkles: "✨" },
      0: { emoji: emojis[0], sparkles: "" }
    }
    
    const stageInfo = stageMap[stageIndex] || { emoji: emojis[0], sparkles: "" }
    
    return {
      stage: stageName,
      emoji: stageInfo.emoji,
      progress: progress,
      sparkles: stageInfo.sparkles
    }
  }

  if (ownedFlowers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-md"
      >
        <div className="text-center py-8">
          <Flower className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-green-600 mb-2">
            Chưa có hoa nào
          </h3>
          <p className="text-gray-600 text-sm">
            Hãy mua hoa đầu tiên từ shop để bắt đầu! 🌸
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <Flower className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-bold text-green-600">🌸 Hoa Của Tôi ({ownedFlowers.length})</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ownedFlowers.map((flowerId, index) => {
          const flower = FLOWERS[flowerId]
          if (!flower) return null
          
          const flowerWater = flowerWaterData[flowerId] || 0
          const difficulty = getDifficulty(flower.price)
          const stage = getFlowerStage(flower, flowerWater)
          const hasEnoughWater = localWater >= 10
          const hasPendingSync = (pendingSync[flowerId] || 0) > 0

          return (
            <motion.div
              key={flowerId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectFlower(flowerId)}
              className="bg-white rounded-xl p-4 border-2 border-green-300 hover:border-green-400 cursor-pointer transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                {/* Flower Display */}
                <div className="relative flex items-center justify-center">
                  {/* Flower */}
                  <motion.div
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 2, -2, 0],
                      scale: hasPendingSync ? [1, 1.1, 1] : 1
                    }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                      scale: { duration: 0.3 }
                    }}
                    className="text-6xl relative"
                  >
                    {stage.emoji}
                    
                    {/* Sparkles around flower */}
                    {stage.sparkles && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0],
                          scale: [0, 1.2, 0],
                          rotate: [0, 180, 360]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute -top-4 -left-4 text-xl"
                      >
                        {stage.sparkles}
                      </motion.div>
                    )}
                    
                    {/* Growing effect */}
                    {flowerWater > 0 && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 blur-xl"
                      />
                    )}
                  </motion.div>

                  {/* Watering effect */}
                  {hasPendingSync && (
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: -30, opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute -top-2 text-blue-400 text-2xl"
                    >
                      💧
                    </motion.div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-800">
                      {flower.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full bg-green-100 ${difficulty.color}`}>
                        {difficulty.level}
                      </span>
                                             {onWaterFlower && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleWaterClick(flowerId)
                          }}
                          disabled={!hasEnoughWater}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-3 py-1 rounded-lg text-sm font-semibold transition flex items-center gap-1"
                        >
                          💧 Tưới 10
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Trạng thái: {stage.stage}</span>
                      <span className="font-semibold text-green-600">{stage.progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stage.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        className={`h-full rounded-full bg-gradient-to-r ${flower.gradient}`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>💎 Giá: {flower.price} xu</span>
                    <span>•</span>
                    <span>💧 Nước hoa: {flowerWater}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 space-y-2"
      >
        {/* Status indicator */}
        {Object.keys(pendingSync).length > 0 && (
          <div className="text-center text-xs text-orange-600 bg-orange-50 rounded-lg p-2 border border-orange-200">
            📦 {Object.keys(pendingSync).length} thay đổi đang chờ đồng bộ...
          </div>
        )}
        
        <div className="text-center text-xs text-gray-600 bg-white/60 rounded-lg p-3">
          💡 Tip: Tưới nước cho hoa để phát triển! Nước: {localWater} 💧
        </div>
      </motion.div>
    </motion.div>
  )
}
