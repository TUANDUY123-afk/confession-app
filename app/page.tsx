"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ConfessionCard from "@/components/confession-card"
import FloatingHearts from "@/components/floating-hearts"
import ConfessionMessage from "@/components/confession-message"
import VersionBadge from "@/components/version-badge"
import Link from "next/link"

const APP_VERSION = "v2"

export default function Home() {
  const [showMessage, setShowMessage] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const router = useRouter()

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen 
      bg-gradient-to-br from-pink-100 via-rose-100 to-purple-100 overflow-hidden 
      text-center px-4 sm:px-6"
    >
      {/* Version tag */}
      <VersionBadge version={APP_VERSION} />

      {/* 💞 Hiệu ứng tim bay */}
      <FloatingHearts />

      {/* 🌸 Tiêu đề */}
      <h1
        className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-pink-600 
        drop-shadow mb-4 sm:mb-6 animate-fade-in"
      >
        💖 Lời Tỏ Tình 💖
      </h1>

      {/* 💌 Thẻ tỏ tình hoặc lời nhắn */}
      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg mx-auto flex justify-center items-center">
        {!showMessage ? (
          <ConfessionCard
            onReveal={() => setShowMessage(true)}
            onAccepted={() => {
              setAccepted(true)
              setShowMessage(true)
            }}
          />
        ) : (
          <ConfessionMessage
            accepted={accepted}
            onAccepted={() => {
              setAccepted(true)
              // ❤️ Khi đồng ý, tự động chuyển sau 1.5s
              setTimeout(() => router.push("/anniversary"), 1500)
            }}
          />
        )}
      </div>

      {/* 🌈 Nút điều hướng */}
      <div
        className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8 sm:mt-10 
        animate-fade-in-delay px-2"
      >
        <Link
          href="/love-story"
          className="bg-rose-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full 
          shadow hover:bg-rose-500 active:scale-95 transition-all duration-200 
          text-sm sm:text-base"
        >
          📖 Chuyện tình
        </Link>
        <Link
          href="/photo-wall"
          className="bg-purple-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full 
          shadow hover:bg-purple-500 active:scale-95 transition-all duration-200 
          text-sm sm:text-base"
        >
          📸 Tường ảnh
        </Link>
        <Link
          href="/shared-diary"
          className="bg-pink-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full 
          shadow hover:bg-pink-500 active:scale-95 transition-all duration-200 
          text-sm sm:text-base"
        >
          📔 Nhật ký chung
        </Link>
      </div>

      {/* 🌺 Hiệu ứng fade nhẹ ở dưới (cho cảm giác chiều sâu) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/40 via-transparent to-transparent pointer-events-none" />
    </main>
  )
}
