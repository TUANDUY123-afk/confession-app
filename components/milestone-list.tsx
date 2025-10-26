"use client"

import { motion } from "framer-motion"
import { CheckCircle, Heart } from "lucide-react"

// 🌸 Các mốc hàng trăm ngày và tròn năm
const milestones = [
  { days: 100, label: "100 ngày 💞" },
  { days: 200, label: "200 ngày 🌷" },
  { days: 300, label: "300 ngày 🌈" },
  { days: 365, label: "1 năm 💍" },
  { days: 500, label: "500 ngày 💓" },
  { days: 730, label: "2 năm 🎉" },
  { days: 1000, label: "1000 ngày ✨" },
  { days: 1095, label: "3 năm 💞" },
]

interface MilestoneProgressProps {
  currentDays: number
}

export default function MilestoneProgress({ currentDays }: MilestoneProgressProps) {
  const next = milestones.find((m) => m.days > currentDays)
  const prev = milestones
    .slice()
    .reverse()
    .find((m) => m.days <= currentDays)

  const progress =
    prev && next
      ? ((currentDays - prev.days) / (next.days - prev.days)) * 100
      : next
      ? (currentDays / next.days) * 100
      : 100

  const remainingDays = next ? next.days - currentDays : 0

  return (
    <div className="mb-10 px-2">
      {/* 🌈 Thanh tiến trình tổng */}
      {next && (
        <>
          <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
            <span>{currentDays} ngày</span>
            <span>{next.label}</span>
          </div>

          <div className="w-full h-3 bg-pink-100 rounded-full overflow-hidden shadow-inner mb-3 relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 rounded-full"
            />
            <motion.div
              className="absolute top-0 left-0 h-full w-1 bg-white/60 blur-sm rounded-full"
              animate={{ x: ["0%", "100%"] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <p className="text-center text-xs text-gray-500 mb-6 italic">
            Còn {remainingDays} ngày nữa đến {next.label} 💖
          </p>
        </>
      )}

      {/* 💞 Timeline ngang cuộn được */}
      <div className="relative overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-start gap-6 min-w-max px-1 py-2">
          {/* Đường nối */}
          <motion.div
            className="absolute top-[36px] left-0 h-[2px] bg-pink-200 w-full -z-10"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />

          {milestones.map((m, i) => {
            const reached = currentDays >= m.days
            return (
              <motion.div
                key={m.days}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="flex flex-col items-center text-center min-w-[80px]"
              >
                <motion.div
                  className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border-4 mb-2 shadow-sm
                    ${reached
                      ? "border-pink-400 bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600"
                      : "border-gray-300 bg-gray-50 text-gray-400"
                    }`}
                  animate={reached ? { scale: [1, 1.1, 1] } : {}}
                  transition={reached ? { repeat: Infinity, duration: 2.5 } : {}}
                >
                  {reached ? (
                    <CheckCircle className="w-5 h-5 text-pink-500" />
                  ) : (
                    <Heart className="w-5 h-5 text-gray-300" />
                  )}
                </motion.div>

                <span
                  className={`text-[11px] sm:text-sm font-semibold ${
                    reached ? "text-pink-600" : "text-gray-400"
                  } whitespace-nowrap`}
                >
                  {m.label}
                </span>
                <p className="text-[10px] text-gray-400">{m.days} ngày</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
