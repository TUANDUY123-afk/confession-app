"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart } from "lucide-react"

interface ConfessionCardProps {
  onReveal: () => void
  onAccepted: () => void
}

export default function ConfessionCard({ onReveal, onAccepted }: ConfessionCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [isMessageRead, setIsMessageRead] = useState(false)
  const [showTransition, setShowTransition] = useState(false)
  const [rejectPosition, setRejectPosition] = useState({ x: 0, y: 0 })
  const [rejectScale, setRejectScale] = useState(1)

  const handleFlip = () => {
    if (!isFlipped) {
      setIsFlipped(true)
      setTimeout(() => setShowButtons(true), 600)
    }
  }

  const handleReveal = () => {
    // Hiệu ứng mờ dần rồi hiển thị lời nhắn
    setShowTransition(true)
    setTimeout(() => {
      setIsMessageRead(true)
      onReveal()
      setShowTransition(false)
    }, 1200)
  }

  const handleReject = () => {
    const randomX = (Math.random() - 0.5) * 280
    const randomY = (Math.random() - 0.5) * 160
    const newScale = Math.max(0.35, rejectScale - 0.1)
    setRejectPosition({ x: randomX, y: randomY })
    setRejectScale(newScale)
  }

  return (
    <div className="relative z-10 flex flex-col items-center">
      {/* 💌 Thiệp tỏ tình lật 2 mặt */}
      <div
        className="w-72 sm:w-80 h-96 sm:h-[26rem] cursor-pointer perspective"
        onClick={handleFlip}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-gpu ${
            isFlipped ? "rotate-y-180" : ""
          }`}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 🌸 Mặt trước */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-pink-400 to-rose-400 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 text-white"
            style={{ backfaceVisibility: "hidden" }}
          >
            <Heart className="w-20 h-20 mb-4 animate-pulse" fill="white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4">Gửi Yến Nhi 💌</h1>
            <p className="text-lg text-center opacity-90">Nhấn để mở thiệp</p>
            <div className="mt-6 text-sm opacity-75">💝</div>
          </div>

          {/* 💖 Mặt sau */}
          <div
            className="absolute w-full h-full bg-gradient-to-br from-rose-100 to-pink-200 rounded-2xl shadow-2xl flex flex-col items-center justify-center p-8 text-rose-700"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold">Yến Nhi yêu dấu 💕</h2>
              <p className="text-base sm:text-lg leading-relaxed">
                Nhân ngày 20/10 anh có đôi lời muốn nói với em.
              </p>
              <p className="text-base opacity-80">Em là người đặc biệt nhất trong tim anh 💖</p>
            </div>
          </div>
        </div>
      </div>

      {/* 💞 Nút hành động */}
      {showButtons && (
        <div className="mt-8 flex gap-4 justify-center animate-fade-in relative h-16">
          {!isMessageRead ? (
            <button
              onClick={handleReveal}
              className="px-8 py-3 bg-white/80 text-rose-600 font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-2 border-rose-300 backdrop-blur-md"
            >
              Xem thêm 💌
            </button>
          ) : (
            <>
              <button
                onClick={onAccepted}
                className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Đồng ý ❤️
              </button>

              <button
                onClick={handleReject}
                className="absolute px-6 py-3 bg-gray-100 text-gray-500 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-300"
                style={{
                  transform: `translate(${rejectPosition.x}px, ${rejectPosition.y}px) scale(${rejectScale})`,
                  transition: "transform 0.35s ease-out",
                }}
              >
                Từ chối 😢
              </button>
            </>
          )}
        </div>
      )}

      {/* 🌈 Hiệu ứng chuyển cảnh */}
      <AnimatePresence>
        {showTransition && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center rounded-3xl z-50"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl sm:text-3xl font-bold text-rose-600"
            >
              💞 Đang mở lời nhắn dành riêng cho em...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
