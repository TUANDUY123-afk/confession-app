"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart, History, Info } from "lucide-react"
import Link from "next/link"
import LovePointsDisplay from "@/components/love-points-display"
import LoveTree from "@/components/love-tree"
import AchievementsDisplay from "@/components/achievements-display"
import FloatingHearts from "@/components/floating-hearts"
import FlowerShop from "@/components/flower-shop"
import MyFlowers from "@/components/my-flowers"
import FlowerProgress from "@/components/flower-progress"
import WaterHistoryModal from "@/components/water-history-modal"
import WaterEarnInfoModal from "@/components/water-earn-info-modal"

export default function GamificationPage() {
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [ownedFlowers, setOwnedFlowers] = useState<string[]>([])
  const [currentFlower, setCurrentFlower] = useState<string | undefined>()
  const [showShop, setShowShop] = useState(false)
  const [showFlowerDetail, setShowFlowerDetail] = useState(false)
  const [selectedFlowerDetail, setSelectedFlowerDetail] = useState<string | null>(null)
  const [claimedStages, setClaimedStages] = useState<string[]>([])
  const [showClaimPopup, setShowClaimPopup] = useState(false)
  const [flowerWaterMap, setFlowerWaterMap] = useState<{ [key: string]: number }>({})
  const [showWaterHistory, setShowWaterHistory] = useState(false)
  const [showWaterEarnInfo, setShowWaterEarnInfo] = useState(false)

  const handleClaimReward = async (coins: number, stageIndex: number, flowerId?: string) => {
    try {
      const claimId = flowerId ? `${flowerId}_${stageIndex}` : stageIndex.toString()
      
      const response = await fetch("/api/gamification/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "claim_flower_stage_reward",
          points: 0,
          coins: coins,
          claimed_stage: claimId,
          description: `Nhận thưởng giai đoạn ${stageIndex}${flowerId ? ` - ${flowerId}` : ''}`,
        }),
      })
      
      if (!response.ok) {
        console.error("claimReward: Response not ok", response.status)
        return
      }
      
      const data = await response.json().catch(err => {
        console.error("claimReward: JSON parse error", err)
        return null
      })
      
      if (!data) return
      
      console.log("Claim reward response:", data)
      
      // Update local state immediately for better UX
      setTotalCoins(prev => prev + coins)
      
      // Refresh data from server
      setRefreshKey(prev => prev + 1)
      
      console.log(`✅ Đã nhận ${coins} xu! 🎉`)
    } catch (err) {
      console.error("Error claiming reward:", err)
    }
  }

  const getAllAvailableClaims = () => {
    const claims: Array<{ flowerId: string, flowerName: string, stageIndex: number, coins: number, currentFlowerPrice: number }> = []
    
    ownedFlowers.forEach(flowerId => {
      const flowerPrice = getFlowerPrice(flowerId)
      const flowerNames: { [key: string]: string } = {
        rose: "Hoa Hồng",
        tulip: "Hoa Tulip",
        sunflower: "Hoa Hướng Dương",
        jasmine: "Hoa Nhài",
        lavender: "Hoa Oải Hương",
        cherry: "Hoa Anh Đào",
      }
      
      let thresholds: number[]
      let rewards: number[]
      
      if (flowerPrice >= 200) {
        thresholds = [0, 300, 600, 1000]
        rewards = [50, 150, 400]
      } else if (flowerPrice >= 150) {
        thresholds = [0, 200, 500, 800]
        rewards = [30, 100, 250]
      } else {
        thresholds = [0, 100, 200, 500]
        rewards = [20, 60, 150]
      }
      
             // Check each stage
       // IMPORTANT: We need to check per flower, not globally
       // So we need to track claimed stages per flower
       // For now, we'll track globally by combining flowerId and stageIndex
       const flowerPoints = flowerWaterMap[flowerId] || 0 // Use flower-specific points
       for (let i = 1; i <= 3; i++) {
         const claimId = `${flowerId}_${i}` // Create unique claim ID
         if (flowerPoints >= thresholds[i] && !claimedStages.includes(claimId)) {
           claims.push({
             flowerId,
             flowerName: flowerNames[flowerId] || flowerId,
             stageIndex: i,
             coins: rewards[i - 1],
             currentFlowerPrice: flowerPrice
           })
         }
       }
    })
    
    return claims
  }

  const getCurrentStage = (points: number) => {
    const flowerPrice = selectedFlowerDetail ? getFlowerPrice(selectedFlowerDetail) : 100
    if (flowerPrice >= 200) {
      if (points >= 1000) return 3
      if (points >= 600) return 2
      if (points >= 300) return 1
      return 0
    } else if (flowerPrice >= 150) {
      if (points >= 800) return 3
      if (points >= 500) return 2
      if (points >= 200) return 1
      return 0
    } else {
      if (points >= 500) return 3
      if (points >= 200) return 2
      if (points >= 100) return 1
      return 0
    }
  }

  useEffect(() => {
    fetchPoints()
  }, [refreshKey])

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/gamification/points", { cache: 'force-cache' })
      if (!res.ok) {
        console.error("fetchPoints: Response not ok", res.status)
        return
      }
      const data = await res.json().catch(err => {
        console.error("fetchPoints: JSON parse error", err)
        return { water: 0, coins: 0, owned_flowers: [], claimed_stages: [] }
      })
      setTotalPoints(data.water || 0) // Change to water
      setTotalCoins(data.coins || 0)
      setOwnedFlowers(data.owned_flowers || [])
      setClaimedStages(data.claimed_stages || [])
      
      // Fetch flower water data
      if (data.owned_flowers && data.owned_flowers.length > 0) {
        const flowerRes = await fetch("/api/gamification/flower-points", { cache: 'force-cache' })
        if (!flowerRes.ok) {
          console.error("fetchFlowerPoints: Response not ok", flowerRes.status)
          return
        }
        const flowerData = await flowerRes.json().catch(err => {
          console.error("fetchFlowerPoints: JSON parse error", err)
          return []
        })
        const waterMap: { [key: string]: number } = {}
        flowerData.forEach((item: any) => {
          waterMap[item.flower_id] = item.points || 0
        })
        setFlowerWaterMap(waterMap)
      }
    } catch (err) {
      console.error("Error fetching points:", err)
    }
  }
  
  const handleWaterConsumed = (amount: number) => {
    // Update local state immediately - this triggers UI update
    setTotalPoints(prev => {
      const newValue = Math.max(0, prev - amount)
      console.log("Water consumed:", {
        prev,
        amount,
        newValue
      })
      return newValue
    })
  }

  const handleWaterFlower = async (flowerId: string, waterAmount: number) => {
    try {
      const response = await fetch("/api/gamification/flower-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flower_id: flowerId,
          water_to_add: waterAmount,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(errorText || "Sync failed")
      }
      
      const data = await response.json().catch(err => {
        console.error("waterFlower: JSON parse error", err)
        throw new Error("Failed to parse response")
      })
      
      // Update total water from server response
      if (data.remaining_water !== undefined) {
        setTotalPoints(data.remaining_water)
        console.log("Updated total water from server:", data.remaining_water)
      }
      
      // Sync flower water data from server to ensure accuracy
      try {
        const res = await fetch("/api/gamification/flower-points", { cache: 'force-cache' })
        if (!res.ok) {
          console.error("syncFlowerData: Response not ok", res.status)
          return
        }
        const flowerData = await res.json().catch(err => {
          console.error("syncFlowerData: JSON parse error", err)
          return []
        })
        const waterMap: { [key: string]: number } = {}
        flowerData.forEach((item: any) => {
          waterMap[item.flower_id] = item.points || 0
        })
        
        // Update local state with server data
        setFlowerWaterMap(waterMap)
        console.log("✅ Synced flower water data from server:", waterMap)
      } catch (syncErr) {
        console.error("Error syncing flower data:", syncErr)
        // Fallback: update locally
        setFlowerWaterMap(prev => ({
          ...prev,
          [flowerId]: (prev[flowerId] || 0) + waterAmount
        }))
      }
      
      console.log(`✅ Đã tưới ${waterAmount} nước cho hoa! 💧`)
    } catch (err) {
      console.error("Error watering flower:", err)
      throw err // Re-throw to trigger rollback in MyFlowers
    }
  }

  const handleAddTestWater = async (water: number) => {
    try {
      console.log("Adding water:", water)
      const response = await fetch("/api/gamification/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "test",
          points: water,
          description: `Test: Thêm ${water} nước`,
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(errorText || "Failed to add water")
      }
      
      const data = await response.json().catch(err => {
        console.error("addWater: JSON parse error", err)
        throw new Error("Failed to parse response")
      })
      console.log("Response:", data)
      
      // Refresh all components
      setRefreshKey(prev => prev + 1)
      console.log(`✅ Đã thêm ${water} nước!`)
    } catch (err) {
      console.error("Error adding water:", err)
    }
  }

  const handleResetPoints = async () => {
    if (!confirm("⚠️ Bạn có chắc muốn reset TẤT CẢ về 0?\n\nNước, streak, xu, và tất cả hoa đã mua sẽ bị xóa!")) {
      return
    }

    try {
      const response = await fetch("/api/gamification/points/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(errorText || "Failed to reset")
      }
      
      const data = await response.json().catch(err => {
        console.error("resetAll: JSON parse error", err)
        throw new Error("Failed to parse response")
      })
      
      // Reset all local state
      setOwnedFlowers([])
      setCurrentFlower(undefined)
      setSelectedFlowerDetail(null)
      setClaimedStages([])
      setShowClaimPopup(false)
      setShowFlowerDetail(false)
      setShowShop(false)
      
      // Refresh all components
      setRefreshKey(prev => prev + 1)
      console.log("✅ Đã reset tất cả về 0!")
    } catch (err) {
      console.error("Error resetting:", err)
    }
  }

  const handleBuyFlower = async (flowerId: string, price: number, useCoins: boolean) => {
    try {
      if (useCoins && price > 0) {
        // Deduct coins when buying with coins
        await fetch("/api/gamification/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_type: "buy_flower_with_coins",
            points: 0,
            coins: -price,
            owned_flower: flowerId,
            description: `Mua hoa bằng xu: ${flowerId}`,
          }),
        })
      } else {
        // Add flower for free
        await fetch("/api/gamification/points", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            activity_type: "claim_free_flower",
            points: 0,
            coins: 0,
            owned_flower: flowerId,
            description: `Nhận hoa miễn phí: ${flowerId}`,
          }),
        })
      }
      
      setCurrentFlower(flowerId)
      setRefreshKey(prev => prev + 1)
      setShowShop(false) // Close shop after purchase
      
      const message = useCoins && price > 0 
        ? `✅ Đã mua hoa thành công bằng ${price} xu! 🌸`
        : `✅ Đã nhận hoa miễn phí! 🌸`
      console.log(message)
    } catch (err) {
      console.error("Error buying flower:", err)
    }
  }

  const handleSelectFlower = (flowerId: string) => {
    setCurrentFlower(flowerId)
    setSelectedFlowerDetail(flowerId)
    setShowFlowerDetail(true)
  }

  const getFlowerPrice = (flowerId: string | null) => {
    if (!flowerId) return 100
    const prices: { [key: string]: number } = {
      rose: 100,
      tulip: 120,
      sunflower: 150,
      jasmine: 160,
      lavender: 180,
      cherry: 200,
    }
    return prices[flowerId] || 100
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 py-12 overflow-hidden">
      {/* 💞 Hiệu ứng tim bay */}
      <FloatingHearts />

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <Link href="/" className="flex items-center text-rose-500 mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            🌸 Vườn Tình Yêu
          </h1>
          <p className="text-gray-600 mb-4">
            Chăm sóc hoa, kiếm nước, mở khóa thành tích!
          </p>
          
          {/* Test Buttons - TẠM TẮT */}
          {false && (
            <>
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => handleAddTestWater(10)}
                  className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition font-semibold flex items-center gap-1"
                >
                  💧 +10
                </button>
                <button
                  onClick={() => handleAddTestWater(50)}
                  className="bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cyan-600 transition font-semibold flex items-center gap-1"
                >
                  💧 +50
                </button>
                <button
                  onClick={() => handleAddTestWater(100)}
                  className="bg-teal-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-teal-600 transition font-semibold flex items-center gap-1"
                >
                  💧 +100
                </button>
                <button
                  onClick={() => handleAddTestWater(1000)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm hover:from-blue-600 hover:to-cyan-600 transition font-bold flex items-center gap-1"
                >
                  💧 +1000
                </button>
                <button
                  onClick={handleResetPoints}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition font-semibold"
                >
                  🔄 Reset
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">🧪 Test buttons - Thêm nước</p>
            </>
          )}
        </div>

                 {/* Love Points */}
         <div className="mb-6">
           <LovePointsDisplay refreshKey={refreshKey} currentWater={totalPoints} />
         </div>

         {/* Small Action Buttons */}
         <div className="mb-6 flex gap-3">
           <button
             onClick={() => setShowWaterEarnInfo(true)}
             className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-lg shadow-md hover:from-blue-600 hover:to-purple-600 transition-all font-medium flex items-center justify-center gap-2 text-sm"
           >
             <Info className="w-4 h-4" />
             💡 Cách kiếm nước
           </button>
           <button
             onClick={() => setShowWaterHistory(true)}
             className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-2 px-4 rounded-lg shadow-md hover:from-cyan-600 hover:to-blue-600 transition-all font-medium flex items-center justify-center gap-2 text-sm"
           >
             <History className="w-4 h-4" />
             📜 Lịch sử
           </button>
         </div>

        {/* My Flowers */}
        <div className="mb-6">
          <MyFlowers 
            ownedFlowers={ownedFlowers}
            totalPoints={totalPoints}
            onSelectFlower={handleSelectFlower}
            onWaterFlower={handleWaterFlower}
            currentWater={totalPoints}
            onWaterConsumed={handleWaterConsumed}
          />
        </div>

        {/* Claim Coins Button - Always visible when has flowers */}
        {ownedFlowers.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowClaimPopup(true)}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-2xl shadow-lg hover:from-yellow-500 hover:to-orange-600 transition-all font-bold text-lg flex items-center justify-center gap-2 animate-pulse"
            >
              🎁 Nhận Xu
            </button>
          </div>
        )}



        {/* Open Shop Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowShop(true)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition-all font-bold text-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-6 h-6" />
            🌸 Mở Shop Hoa
          </button>
        </div>

        {/* Flower Shop Popup */}
        {showShop && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowShop(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    🌸 Shop Hoa
                  </h2>
                  <button
                    onClick={() => setShowShop(false)}
                    className="text-gray-500 hover:text-gray-700 transition text-2xl"
                  >
                    ×
                  </button>
                </div>
                                 <FlowerShop 
                   currentPoints={totalPoints}
                   currentCoins={totalCoins}
                   ownedFlowers={ownedFlowers}
                   onBuyFlower={handleBuyFlower}
                 />
              </div>
            </div>
          </div>
        )}

        {/* Flower Detail Popup */}
        {showFlowerDetail && selectedFlowerDetail && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowFlowerDetail(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-green-600 flex items-center gap-2">
                    🌸 Vườn Tình Yêu
                  </h2>
                  <button
                    onClick={() => setShowFlowerDetail(false)}
                    className="text-gray-500 hover:text-gray-700 transition text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Love Tree */}
                  <LoveTree 
                    totalPoints={flowerWaterMap[selectedFlowerDetail] || 0} 
                    currentFlower={selectedFlowerDetail} 
                  />
                  
                                     {/* Flower Progress */}
                                       <FlowerProgress 
                      totalPoints={totalPoints}
                      flowerPrice={getFlowerPrice(selectedFlowerDetail)}
                      currentStage={0}
                      onClaimReward={(coins) => handleClaimReward(coins, getCurrentStage(flowerWaterMap[selectedFlowerDetail] || 0), selectedFlowerDetail || undefined)}
                      claimedStages={claimedStages}
                      flowerId={selectedFlowerDetail}
                      flowerWater={flowerWaterMap[selectedFlowerDetail]}
                    />
                </div>
              </div>
            </div>
          </div>
                 )}

        {/* Claim Coins Popup */}
        {showClaimPopup && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowClaimPopup(false)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-yellow-600 flex items-center gap-2">
                    🎁 Nhận Xu Thưởng
                  </h2>
                  <button
                    onClick={() => setShowClaimPopup(false)}
                    className="text-gray-500 hover:text-gray-700 transition text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  {getAllAvailableClaims().length > 0 ? (
                    getAllAvailableClaims().map((claim, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-gray-800">{claim.flowerName}</div>
                            <div className="text-sm text-gray-600">Giai đoạn {claim.stageIndex}: {claim.stageIndex === 1 ? 'Phát Triển' : claim.stageIndex === 2 ? 'Chớm Nở' : 'Nở Rộ'}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-bold text-yellow-600 flex items-center gap-1">
                              <span>🪙</span>
                              {claim.coins}
                            </div>
                                                         <button
                               onClick={() => {
                                 handleClaimReward(claim.coins, claim.stageIndex, claim.flowerId)
                                 setShowClaimPopup(false)
                               }}
                               className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all"
                             >
                               Nhận
                             </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">🎯</div>
                      <div className="font-semibold">Chưa có xu nào để nhận</div>
                      <div className="text-sm mt-2">Tiếp tục kiếm điểm để nhận xu thưởng!</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="mb-6" key={`achievements-${refreshKey}`}>
          <AchievementsDisplay />
        </div>

        {/* Water History Modal */}
        <WaterHistoryModal
          isOpen={showWaterHistory}
          onClose={() => setShowWaterHistory(false)}
        />

        {/* Water Earn Info Modal */}
        <WaterEarnInfoModal
          isOpen={showWaterEarnInfo}
          onClose={() => setShowWaterEarnInfo(false)}
        />
      </div>
    </main>
  )
}
