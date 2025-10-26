"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, Heart } from "lucide-react"

interface Flower {
  id: string
  name: string
  emoji: string
  price: number
  color: string
  description: string
  gradient: string
}

const FLOWERS: Flower[] = [
  {
    id: "rose",
    name: "Hoa Hồng",
    emoji: "🌹",
    price: 100,
    color: "red-500",
    description: "Hoa hồng đỏ - biểu tượng của tình yêu đam mê",
    gradient: "from-red-500 to-pink-600"
  },
  {
    id: "cherry",
    name: "Hoa Anh Đào",
    emoji: "🌸",
    price: 200,
    color: "pink-400",
    description: "Hoa anh đào - sự dịu dàng, ngọt ngào",
    gradient: "from-pink-400 to-rose-500"
  },
  {
    id: "sunflower",
    name: "Hoa Hướng Dương",
    emoji: "🌻",
    price: 150,
    color: "yellow-500",
    description: "Hoa hướng dương - ánh sáng và niềm vui",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    id: "tulip",
    name: "Hoa Tulip",
    emoji: "🌷",
    price: 120,
    color: "purple-400",
    description: "Hoa tulip - sự hoàn mỹ và tình yêu vĩnh cửu",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    id: "lavender",
    name: "Hoa Oải Hương",
    emoji: "🪻",
    price: 180,
    color: "purple-500",
    description: "Hoa oải hương - sự bình yên và tịnh tâm",
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    id: "jasmine",
    name: "Hoa Nhài",
    emoji: "🤍",
    price: 160,
    color: "white",
    description: "Hoa nhài - sự tinh khiết và vẻ đẹp tự nhiên",
    gradient: "from-gray-100 to-white"
  }
]

interface FlowerShopProps {
  currentPoints: number
  currentCoins: number
  ownedFlowers: string[]
  onBuyFlower: (flowerId: string, price: number, useCoins: boolean) => void
}

export default function FlowerShop({ currentPoints, currentCoins, ownedFlowers, onBuyFlower }: FlowerShopProps) {
  const [selectedFlower, setSelectedFlower] = useState<Flower | null>(null)

  const handleBuy = (flower: Flower) => {
    const isFirstFlower = ownedFlowers.length === 0
    
    if (isFirstFlower) {
      // Hoa đầu tiên miễn phí
      onBuyFlower(flower.id, 0, false)
      setSelectedFlower(null)
    } else {
      // Hoa sau mua bằng xu
      if (currentCoins >= flower.price) {
        onBuyFlower(flower.id, flower.price, true)
        setSelectedFlower(null)
      } else {
        alert(`❌ Không đủ xu! Cần thêm ${flower.price - currentCoins} xu.`)
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 shadow-md"
    >
      <div className="flex items-center gap-2 mb-6">
        <ShoppingCart className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-bold text-purple-600">🌸 Shop Hoa</h3>
      </div>

      <div className="mb-4 p-3 bg-white/80 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Điểm</div>
            <div className="text-2xl font-bold text-pink-600 flex items-center justify-center gap-2">
              <Heart className="w-5 h-5 fill-pink-500 text-pink-500" />
              {currentPoints}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Xu</div>
            <div className="text-2xl font-bold text-yellow-600 flex items-center justify-center gap-2">
              <span>🪙</span>
              {currentCoins}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {FLOWERS.map((flower) => {
          const isOwned = ownedFlowers.includes(flower.id)
          const isFirstFlower = ownedFlowers.length === 0
          const canAfford = isFirstFlower ? true : currentCoins >= flower.price

          return (
            <motion.div
              key={flower.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative bg-white rounded-xl p-4 border-2 cursor-pointer transition-all ${
                isOwned
                  ? 'border-green-400 bg-green-50'
                  : canAfford
                  ? 'border-purple-300 hover:border-purple-400'
                  : 'border-gray-200 opacity-60'
              }`}
              onClick={() => !isOwned && canAfford && setSelectedFlower(flower)}
            >
              {isOwned && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  ✓
                </div>
              )}
              
              <div className="text-4xl mb-2 text-center">{flower.emoji}</div>
              <div className="text-sm font-semibold text-gray-800 text-center mb-1">
                {flower.name}
              </div>
              <div className="text-xs text-gray-600 text-center mb-3">
                {flower.description}
              </div>
              
              {!isOwned && (
                <div className="space-y-2">
                  {isFirstFlower ? (
                    <div className="text-center">
                      <div className="text-xs font-bold text-green-600 mb-1">🎁 MIỄN PHÍ</div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuy(flower)
                        }}
                        className={`w-full bg-gradient-to-r ${flower.gradient} text-white py-2 rounded-lg text-sm font-semibold`}
                      >
                        Nhận Ngay
                      </motion.button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">Giá:</span>
                        <span className="text-lg font-bold text-yellow-600 flex items-center gap-1">
                          <span>🪙</span>
                          {flower.price}
                        </span>
                      </div>
                      {canAfford && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleBuy(flower)
                          }}
                          className={`w-full bg-gradient-to-r ${flower.gradient} text-white py-2 rounded-lg text-sm font-semibold`}
                        >
                          Mua Bằng Xu
                        </motion.button>
                      )}
                      {!canAfford && (
                        <div className="text-center text-xs text-red-500 font-semibold">
                          Không đủ xu
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
