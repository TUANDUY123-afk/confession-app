"use client"

import { Heart } from "lucide-react"
import { motion } from "framer-motion"

interface LoveStoryHeaderProps {
  daysTogether: number
  startDate: string
  title: string
}

export default function LoveStoryHeader({ daysTogether, startDate, title }: LoveStoryHeaderProps) {
  const startDateObj = new Date(startDate)
  const monthYear = startDateObj.toLocaleDateString("vi-VN", { month: "long", year: "numeric" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden rounded-3xl p-8 text-center mb-8 shadow-md border border-pink-100
                 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200"
    >
      {/* Hiệu ứng trái tim mờ ở nền */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <Heart className="w-64 h-64 text-rose-300" />
      </div>

      {/* Nội dung chính */}
      <div className="relative z-10">
        <motion.h1
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-4xl font-extrabold text-rose-600 mb-4 drop-shadow-sm"
        >
          {title || "Câu chuyện tình yêu của chúng ta 💕"}
        </motion.h1>

        <motion.div
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex justify-center mb-4"
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500 animate-pulse" />
        </motion.div>

        <div className="text-6xl font-extrabold text-rose-600 mb-2 drop-shadow-sm">
          {daysTogether}
        </div>
        <p className="text-gray-700 text-base font-medium">Ngày bên nhau</p>
        <p className="text-gray-500 text-sm mt-2 italic">Kỷ niệm {monthYear}</p>
      </div>
    </motion.div>
  )
}
