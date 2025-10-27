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
    price: 100,
    gradient: "from-red-500 to-pink-600"
  },
  cherry: {
    id: "cherry",
    name: "Hoa Anh Đào",
    emoji: "🌸",
    price: 200,
    gradient: "from-pink-400 to-rose-500"
  },
  sunflower: {
    id: "sunflower",
    name: "Hoa Hướng Dương",
    emoji: "🌻",
    price: 150,
    gradient: "from-yellow-400 to-orange-500"
  },
  tulip: {
    id: "tulip",
    name: "Hoa Tulip",
    emoji: "🌷",
    price: 120,
    gradient: "from-purple-400 to-pink-500"
  },
  lavender: {
    id: "lavender",
    name: "Hoa Oải Hương",
    emoji: "🪻",
    price: 180,
    gradient: "from-purple-500 to-indigo-600"
  },
  jasmine: {
    id: "jasmine",
    name: "Hoa Nhài",
    emoji: "🤍",
    price: 160,
    gradient: "from-gray-100 to-white"
  }
}

// Define difficulty levels based on price
const getDifficulty = (price: number) => {
  if (price >= 200) return { level: "Rất Khó", thresholds: [0, 300, 600, 1000], color: "text-purple-600" }
  if (price >= 150) return { level: "Khó", thresholds: [0, 200, 500, 800], color: "text-red-600" }
  return { level: "Dễ", thresholds: [0, 100, 200, 500], color: "text-green-600" }
}

export default function MyFlowers({ ownedFlowers, totalPoints, onSelectFlower, onWaterFlower, currentWater, onWaterConsumed }: MyFlowersProps) {
  const [flowerWaterData, setFlowerWaterData] = useState<{ [key: string]: number }>({})
  const [pendingSync, setPendingSync] = useState<{ [key: string]: number }>({})
  const [syncTimeouts, setSyncTimeouts] = useState<{ [key: string]: NodeJS.Timeout }>({})
  const [localWater, setLocalWater] = useState(currentWater)

  // Sync local water with parent
  useEffect(() => {
    setLocalWater(currentWater)
  }, [currentWater])

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
    // Check if has enough water, considering ALL pending syncs across all flowers
    const totalPendingAcrossAllFlowers = Object.values(pendingSync).reduce((sum, val) => sum + val, 0)
    const availableWater = localWater - totalPendingAcrossAllFlowers
    
    console.log("Water check:", {
      localWater,
      totalPendingAcrossAllFlowers,
      availableWater,
      canWater: availableWater >= 10
    })
    
    if (availableWater < 10) {
      console.log("Not enough water to water")
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

    // Decrement local water immediately
    setLocalWater(prev => {
      const newWater = prev - 10
      console.log("Decrementing water:", prev, "->", newWater)
      return newWater
    })

    // Notify parent about water consumption
    if (onWaterConsumed) {
      onWaterConsumed(10)
    }

    // Track pending sync
    setPendingSync(prev => ({
      ...prev,
      [flowerId]: newPending
    }))

    // Clear existing timeout for this flower
    if (syncTimeouts[flowerId]) {
      clearTimeout(syncTimeouts[flowerId])
    }

    // Set new timeout to sync after user stops clicking
    const timeout = setTimeout(async () => {
      // Get the current pending amount at the time of sync
      const waterToAdd = pendingSync[flowerId] || 0
      
      if (waterToAdd > 0 && onWaterFlower) {
        try {
          // Call API to sync
          await onWaterFlower(flowerId, waterToAdd)
          
          // Clear pending sync only after successful sync
          setPendingSync(prev => {
            const newPending = { ...prev }
            delete newPending[flowerId]
            return newPending
          })
        } catch (error: unknown) {
          // If sync fails, revert the UI changes
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.error("Sync failed, reverting UI:", errorMessage)
          setFlowerWaterData(flowerPrev => ({
            ...flowerPrev,
            [flowerId]: Math.max(0, (flowerPrev[flowerId] || 0) - waterToAdd)
          }))
          setLocalWater(waterPrev => waterPrev + waterToAdd)
          if (onWaterConsumed) {
            onWaterConsumed(-waterToAdd) // Revert the consumption
          }
          
          // Clear pending sync even on error
          setPendingSync(errorPrev => {
            const newPending = { ...errorPrev }
            delete newPending[flowerId]
            return newPending
          })
        }
      }

      // Clear timeout
      setSyncTimeouts(timeoutPrev => {
        const newTimeouts = { ...timeoutPrev }
        delete newTimeouts[flowerId]
        return newTimeouts
      })
    }, 300) // Reduced to 300ms for faster sync

    setSyncTimeouts(prev => ({ ...prev, [flowerId]: timeout }))
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
      jasmine: ["🌱", "🌿", "🤍", "🤍"]
    }
    
    const emojis = stageEmojis[flower.id] || ["🌱", "🌿", "🌺", "🌹"]
    
    if (points >= thresholds[3]) return { 
      stage: "Nở Rộ", 
      emoji: emojis[3], // Fully bloomed flower
      progress: 100,
      sparkles: "✨✨✨"
    }
    if (points >= thresholds[2]) return { 
      stage: "Chớm Nở", 
      emoji: emojis[2], // Flowering
      progress: ((points - thresholds[2]) / (thresholds[3] - thresholds[2])) * 100,
      sparkles: "✨✨"
    }
    if (points >= thresholds[1]) return { 
      stage: "Phát Triển", 
      emoji: emojis[1], // Growing plant
      progress: ((points - thresholds[1]) / (thresholds[2] - thresholds[1])) * 100,
      sparkles: "✨"
    }
    return { 
      stage: "Mầm Non", 
      emoji: emojis[0], // Seedling
      progress: ((points - thresholds[0]) / (thresholds[1] - thresholds[0])) * 100,
      sparkles: ""
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
                          {hasPendingSync ? '⏳ Đang đồng bộ...' : '💧 Tưới 10'}
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
        className="mt-4 text-center text-xs text-gray-600 bg-white/60 rounded-lg p-3"
      >
        💡 Tip: Tưới nước cho hoa để phát triển! Nước: {localWater} 💧
      </motion.div>
    </motion.div>
  )
}
