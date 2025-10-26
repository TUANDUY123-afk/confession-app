"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Link from "next/link"
import LovePointsDisplay from "@/components/love-points-display"
import LoveTree from "@/components/love-tree"
import AchievementsDisplay from "@/components/achievements-display"
import FloatingHearts from "@/components/floating-hearts"
import FlowerShop from "@/components/flower-shop"
import MyFlowers from "@/components/my-flowers"
import FlowerProgress from "@/components/flower-progress"

export default function GamificationPage() {
  const [totalPoints, setTotalPoints] = useState(0)
  const [totalCoins, setTotalCoins] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [ownedFlowers, setOwnedFlowers] = useState<string[]>([])
  const [currentFlower, setCurrentFlower] = useState<string | undefined>()
  const [showShop, setShowShop] = useState(false)
  const [showFlowerDetail, setShowFlowerDetail] = useState(false)
  const [selectedFlowerDetail, setSelectedFlowerDetail] = useState<string | null>(null)

  useEffect(() => {
    fetchPoints()
  }, [refreshKey])

  const fetchPoints = async () => {
    try {
      const res = await fetch("/api/gamification/points")
      const data = await res.json()
      setTotalPoints(data.total_points || 0)
      setTotalCoins(data.coins || 0)
    } catch (err) {
      console.error("Error fetching points:", err)
    }
  }

  const handleAddTestPoints = async (points: number) => {
    try {
      console.log("Adding points:", points)
      const response = await fetch("/api/gamification/points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity_type: "test",
          points: points,
          description: `Test: Thêm ${points} điểm`,
        }),
      })
      
      const data = await response.json()
      console.log("Response:", data)
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add points")
      }
      
      // Refresh all components
      setRefreshKey(prev => prev + 1)
      alert(`✅ Đã thêm ${points} điểm!`)
    } catch (err) {
      console.error("Error adding points:", err)
      alert(`Lỗi khi thêm điểm 😢: ${err}`)
    }
  }

  const handleResetPoints = async () => {
    if (!confirm("⚠️ Bạn có chắc muốn reset tất cả điểm về 0?\n\nĐiểm và streak sẽ bị xóa!")) {
      return
    }

    try {
      const response = await fetch("/api/gamification/points/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset points")
      }
      
      // Refresh all components
      setRefreshKey(prev => prev + 1)
      alert("✅ Đã reset điểm về 0!")
    } catch (err) {
      console.error("Error resetting points:", err)
      alert(`Lỗi khi reset điểm 😢: ${err}`)
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
            description: `Mua hoa bằng xu: ${flowerId}`,
          }),
        })
      }
      
      // Add to owned flowers
      setOwnedFlowers(prev => [...prev, flowerId])
      setCurrentFlower(flowerId)
      setRefreshKey(prev => prev + 1)
      setShowShop(false) // Close shop after purchase
      
      const message = useCoins && price > 0 
        ? `✅ Đã mua hoa thành công bằng ${price} xu! 🌸`
        : `✅ Đã nhận hoa miễn phí! 🌸`
      alert(message)
    } catch (err) {
      console.error("Error buying flower:", err)
      alert(`Lỗi khi mua hoa 😢`)
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
          <h1 className="text-3xl font-bold text-pink-600 mb-2">
            🎮 Hệ Thống Gamification
          </h1>
          <p className="text-gray-600 mb-4">
            Kiếm điểm, phát triển cây tình yêu và mở khóa thành tích!
          </p>
          
          {/* Test Buttons */}
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => handleAddTestPoints(10)}
              className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-600 transition font-semibold"
            >
              +10 Điểm
            </button>
            <button
              onClick={() => handleAddTestPoints(50)}
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-600 transition font-semibold"
            >
              +50 Điểm
            </button>
            <button
              onClick={() => handleAddTestPoints(100)}
              className="bg-purple-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-600 transition font-semibold"
            >
              +100 Điểm
            </button>
            <button
              onClick={() => handleAddTestPoints(1000)}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1.5 rounded-lg text-sm hover:from-pink-600 hover:to-rose-600 transition font-bold"
            >
              +1000 Điểm
            </button>
            <button
              onClick={handleResetPoints}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition font-semibold"
            >
              🔄 Reset
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">🧪 Test buttons</p>
        </div>

        {/* Love Points */}
        <div className="mb-6" key={`points-${refreshKey}`}>
          <LovePointsDisplay />
        </div>

        {/* My Flowers */}
        <div className="mb-6">
          <MyFlowers 
            ownedFlowers={ownedFlowers}
            totalPoints={totalPoints}
            onSelectFlower={handleSelectFlower}
          />
        </div>

        {/* Flower Progress & Coins */}
        {ownedFlowers.length > 0 && (
          <div className="mb-6">
            <FlowerProgress 
              totalPoints={totalPoints}
              flowerPrice={currentFlower === "cherry" ? 200 : currentFlower === "sunflower" ? 150 : 100}
              currentStage={0}
            />
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
                    totalPoints={totalPoints} 
                    currentFlower={selectedFlowerDetail} 
                  />
                  
                  {/* Flower Progress */}
                  <FlowerProgress 
                    totalPoints={totalPoints}
                    flowerPrice={getFlowerPrice(selectedFlowerDetail)}
                    currentStage={0}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Achievements */}
        <div className="mb-6" key={`achievements-${refreshKey}`}>
          <AchievementsDisplay />
        </div>

        {/* Info Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-pink-200 shadow-md">
          <h3 className="text-lg font-bold text-pink-600 mb-4">📊 Cách Kiếm Điểm</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-semibold text-gray-800">Tham gia sự kiện đúng giờ</div>
                <div className="text-gray-600">+50 điểm mỗi sự kiện</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <div className="font-semibold text-gray-800">Ghi nhật ký sau sự kiện</div>
                <div className="text-gray-600">+30 điểm</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📸</span>
              <div>
                <div className="font-semibold text-gray-800">Thêm ảnh kỷ niệm</div>
                <div className="text-gray-600">+10 điểm mỗi ảnh</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">💌</span>
              <div>
                <div className="font-semibold text-gray-800">Gửi tin nhắn yêu thương</div>
                <div className="text-gray-600">+5 điểm mỗi tin nhắn</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <div className="font-semibold text-gray-800">Mở khóa thành tích</div>
                <div className="text-gray-600">Bonus 100-500 điểm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
