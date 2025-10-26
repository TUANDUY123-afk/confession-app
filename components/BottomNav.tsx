"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home } from "lucide-react"
import { useEffect, useState } from "react"

export default function BottomNav() {
  const pathname = usePathname()
  const isHome = pathname === "/"

  // 🔹 Thêm khoảng đệm khi cuộn xuống đáy
  const [isAtBottom, setIsAtBottom] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY
      const pageHeight = document.body.offsetHeight
      setIsAtBottom(scrollPosition >= pageHeight - 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      {/* 🔸 Giữ không gian cho nút để tránh che nội dung */}
      <div className="h-20 sm:h-24" />

      <nav
        className={`fixed left-0 right-0 z-50 flex justify-center transition-all duration-300 
          ${isAtBottom ? "bottom-2" : "bottom-6"}`}
      >
        <Link
          href="/"
          aria-label="Trang chủ"
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full text-white font-semibold shadow-lg 
            transition-all duration-300 backdrop-blur-sm
            ${isHome
              ? "bg-gradient-to-r from-pink-500 to-rose-500 scale-105 shadow-pink-300/60" 
              : "bg-gradient-to-r from-pink-400 to-rose-400 hover:scale-105 hover:shadow-pink-200/60"}`}
        >
          <Home className="w-5 h-5 animate-pulse" />
          <span>Trang chủ</span>
        </Link>
      </nav>
    </>
  )
}
