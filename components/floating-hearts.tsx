"use client"

import { useEffect, useState } from "react"

interface Heart {
  id: number
  left: number
  delay: number
  duration: number
}

export default function FloatingHearts() {
  const [hearts, setHearts] = useState<Heart[]>([])

  useEffect(() => {
    const newHearts = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }))
    setHearts(newHearts)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute text-2xl opacity-60 animate-float"
          style={{
            left: `${heart.left}%`,
            bottom: "-50px",
            animation: `float ${heart.duration}s ease-in infinite`,
            animationDelay: `${heart.delay}s`,
          }}
        >
          {["❤️", "💕", "💖", "💗", "💝"][Math.floor(Math.random() * 5)]}
        </div>
      ))}

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
