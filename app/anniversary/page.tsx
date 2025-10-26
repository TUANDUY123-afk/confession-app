"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import FloatingHearts from "@/components/floating-hearts"
import Link from "next/link"

export default function AnniversaryPage() {
  const [daysCount, setDaysCount] = useState(0)

  useEffect(() => {
    const startDate = new Date(2023, 3, 4) // 4/4/2023
    const today = new Date()
    const diff = today.getTime() - startDate.getTime()
    setDaysCount(Math.floor(diff / (1000 * 3600 * 24)))
  }, [])

  const memories = [
    { date: "4/4/2023", title: "Ngày bắt đầu", description: "Khi tình yêu bắt đầu 💞" },
    { date: "20/10/2024", title: "Ngày đặc biệt", description: "Kỷ niệm ngọt ngào cùng nhau 🌸" },
    { date: "Hôm nay", title: "Mãi mãi bên nhau", description: "Và sẽ tiếp tục mãi mãi ❤️" },
  ]

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 flex flex-col items-center justify-center p-4 overflow-hidden">
      {/* 💕 Hiệu ứng tim bay */}
      <FloatingHearts />

      {/* 🌟 Hiệu ứng ánh sáng lung linh */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,192,203,0.3),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,182,193,0.3),transparent_60%)] animate-pulse-slow" />

      <motion.div
        className="max-w-2xl w-full z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* 🌸 Header */}
        <motion.div
          className="text-center mb-10 sm:mb-14"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-rose-600 mb-4 italic">
            Kỷ niệm tình yêu của chúng ta ❤️
          </h1>

          <motion.div
            className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-8 border border-pink-200"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-6xl font-extrabold text-rose-500 mb-2 drop-shadow-sm">
              {daysCount}
            </div>
            <p className="text-gray-700 text-lg">ngày bên nhau</p>
            <p className="text-sm text-gray-500 mt-1">Từ ngày 4/4/2023</p>
          </motion.div>
        </motion.div>

        {/* 💌 Lời cảm ơn */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-10 border border-rose-100"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <h2 className="text-2xl font-serif text-rose-600 mb-4">Lời cảm ơn 💖</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Yến Nhi, cảm ơn em đã đồng ý yêu anh. Cảm ơn em đã tin tưởng, đã ở bên anh qua những lúc khó khăn.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            Cảm ơn em vì mỗi nụ cười, mỗi lời yêu thương, mỗi khoảnh khắc chúng ta chia sẻ cùng nhau. Em làm cuộc đời anh thêm ý nghĩa.
          </p>
          <p className="text-gray-700 leading-relaxed font-medium">
            Anh hứa sẽ luôn yêu em, chăm sóc em, và mãi mãi ở bên em. 💞
          </p>
        </motion.div>

        {/* 🕊 Timeline */}
        <motion.div
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-rose-100"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <h2 className="text-2xl font-serif text-rose-600 mb-6">Hành trình yêu thương 🌹</h2>
          <div className="space-y-6">
            {memories.map((memory, index) => (
              <motion.div
                key={index}
                className="flex gap-4 items-start"
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.3 + index * 0.2, duration: 0.6 }}
              >
                <div className="flex flex-col items-center mt-1">
                  <div className="w-4 h-4 bg-rose-400 rounded-full shadow-md" />
                  {index < memories.length - 1 && (
                    <div className="w-1 h-12 bg-rose-200 mt-2 rounded-full" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-rose-500">{memory.date}</p>
                  <h3 className="text-lg font-bold text-gray-800">{memory.title}</h3>
                  <p className="text-gray-600">{memory.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ✨ Footer */}
        <motion.div
          className="text-center mt-10 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <p className="text-gray-600 italic text-lg">
            “Tình yêu không phải là tìm kiếm một người hoàn hảo,<br />
            mà là yêu một người theo cách hoàn hảo nhất.” 💞
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-semibold shadow hover:scale-105 transition-transform"
          >
            💌 Quay lại trang chính
          </Link>
        </motion.div>
      </motion.div>
    </main>
  )
}
