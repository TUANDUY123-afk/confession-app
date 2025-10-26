"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

interface ConfessionMessageProps {
  accepted: boolean
  onAccepted?: () => void
}

export default function ConfessionMessage({ accepted, onAccepted }: ConfessionMessageProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [showContinue, setShowContinue] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [rejectPosition, setRejectPosition] = useState({ x: 0, y: 0 })
  const [rejectScale, setRejectScale] = useState(1)
  const router = useRouter()

  const fullMessage = `Yến Nhi yêu dấu,

Anh viết những dòng này với tấm lòng chân thành. Trước tiên, anh muốn xin lỗi em vì những lần anh đã làm em buồn, những lần anh không hiểu được cảm xúc của em, và những lúc anh không đủ tốt.

Anh biết rằng anh đã mắc lỗi, nhưng anh cũng biết rằng em là người anh yêu thương nhất. Từ ngày em xuất hiện trong cuộc đời anh, mọi thứ trở nên có ý nghĩa hơn.

Em là ánh sáng sáng nhất trong những ngày tối tăm của anh. Anh yêu cách em cười, cách em nói chuyện, cách em quan tâm đến những người xung quanh.

Anh xin lỗi em từ đáy lòng và anh hứa sẽ cố gắng trở thành người tốt hơn cho em. Anh muốn bên em, hỗ trợ em, và tạo nên những kỷ niệm đẹp cùng em.

Yến Nhi, em có chấp nhận tình cảm chân thành của anh không? 💕`

  // Gõ chữ từng ký tự
  useEffect(() => {
    let index = 0
    const interval = setInterval(() => {
      if (index < fullMessage.length) {
        setDisplayedText(fullMessage.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        setShowContinue(true)
      }
    }, 30)
    return () => clearInterval(interval)
  }, [])

  // Xử lý nút Từ chối chạy trốn
  const handleReject = () => {
    const randomX = (Math.random() - 0.5) * 300
    const randomY = (Math.random() - 0.5) * 300
    setRejectPosition({ x: randomX, y: randomY })
    setRejectScale((prev) => Math.max(prev - 0.2, 0.3))
  }

  // Khi ấn Đồng ý ❤️
  const handleAccept = () => {
    setShowExplosion(true)
    onAccepted?.() // gọi callback truyền từ ngoài (để chuyển trang)
    setTimeout(() => {
      setShowExplosion(false)
      router.push("/anniversary") // chuyển sang trang kỷ niệm
    }, 1500)
  }

  return (
    <div className="relative z-10 max-w-2xl mx-auto">
      <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="w-6 h-6 text-primary animate-pulse" fill="currentColor" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Gửi tới em, Công chúa nhỏ của anh
          </h1>
          <Heart className="w-6 h-6 text-primary animate-pulse" fill="currentColor" />
        </div>

        {/* Message */}
        <div className="text-lg leading-relaxed text-foreground mb-8 min-h-64 whitespace-pre-wrap">
          {displayedText}
          {displayedText.length < fullMessage.length && <span className="animate-pulse">|</span>}
        </div>

        {/* Buttons */}
        {showContinue && (
          <div className="flex flex-col gap-4 animate-fade-in">
            {accepted ? (
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">🎉</div>
                <p className="text-2xl font-bold text-primary">Yến Nhi đã chấp nhận! 💕</p>
                <p className="text-muted-foreground">
                  Cảm ơn em đã cho anh cơ hội này. Anh sẽ yêu thương em hết lòng.
                </p>
              </div>
            ) : (
              <div className="flex gap-4 justify-center items-center relative">
                <button
                  onClick={handleAccept}
                  className="px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300"
                >
                  Đồng ý ❤️
                </button>

                <button
                  onClick={handleReject}
                  style={{
                    transform: `translate(${rejectPosition.x}px, ${rejectPosition.y}px) scale(${rejectScale})`,
                    transition: "transform 0.3s ease-out",
                  }}
                  className="px-8 py-3 bg-gray-200 text-gray-600 font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Từ chối
                </button>
              </div>
            )}
          </div>
        )}

        {/* 💥 Hiệu ứng nổ tim */}
        {showExplosion && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <span
                key={i}
                className="absolute text-pink-500 text-2xl animate-particle"
                style={{
                  left: "50%",
                  top: "50%",
                  transform: `translate(-50%, -50%) rotate(${i * (360 / 20)}deg) translateY(-80px)`,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                💖
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Trang trí */}
      <div className="absolute -top-10 -left-10 text-6xl opacity-20 animate-float">💐</div>
      <div
        className="absolute -bottom-10 -right-10 text-6xl opacity-20 animate-float"
        style={{ animationDelay: "1s" }}
      >
        🌹
      </div>

      {/* CSS keyframes cho hiệu ứng nổ */}
      <style jsx>{`
        @keyframes particle {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5) translateY(-120px);
          }
        }
        .animate-particle {
          animation: particle 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
