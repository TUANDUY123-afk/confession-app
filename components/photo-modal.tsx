"use client"

import type React from "react"
import Image from "next/image"
import { X } from "lucide-react"

interface PhotoModalProps {
  isOpen: boolean
  photoUrl: string
  title: string
  onClose: () => void
}

export default function PhotoModal({ isOpen, photoUrl, title, onClose }: PhotoModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full h-full max-w-5xl max-h-[95vh] animate-scale-up flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-primary-foreground hover:text-accent transition-colors z-10 bg-black/50 rounded-full p-2 hover:bg-black/70"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="relative flex-1 bg-black rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={photoUrl || "/placeholder.svg"}
            alt={title}
            fill
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 95vw"
            priority
          />
        </div>

        <div className="text-center mt-3 px-4">
          <p className="text-primary-foreground text-sm font-semibold truncate">{title}</p>
        </div>
      </div>
    </div>
  )
}
