"use client"

import { useState, useEffect, memo } from "react"
import { Trash2, Heart, MessageCircle, ChevronDown, ChevronUp, User } from "lucide-react"
import Image from "next/image"
import DiaryCommentsSection from "./DiaryCommentsSection"

interface DiaryCardProps {
  entry: any
  onDelete: () => void
  currentUserName: string
}

function DiaryCard({ entry, onDelete, currentUserName }: DiaryCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [commentsCount, setCommentsCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    async function fetchLikesAndComments() {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          fetch(`/api/diary/like?entryId=${entry.id}`),
          fetch(`/api/diary/comments?entryId=${entry.id}`),
        ])

        if (!likesRes.ok || !commentsRes.ok) {
          throw new Error("API returned non-OK status")
        }

        const likesText = await likesRes.text()
        const commentsText = await commentsRes.text()

        const likesData = likesText.startsWith("<") ? {} : JSON.parse(likesText)
        const commentsData = commentsText.startsWith("<") ? {} : JSON.parse(commentsText)

        setLikesCount(likesData.count || 0)
        setHasLiked(likesData.likedByCurrentUser || false)
        setCommentsCount(commentsData.count || 0)
      } catch (err) {
        console.error("Error fetching likes/comments:", err)
      }
    }

    fetchLikesAndComments()
  }, [entry.id])

  async function handleLike() {
    try {
      const res = await fetch(`/api/diary/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId: entry.id, userName: currentUserName }),
      })

      if (res.ok) {
        const data = await res.json()
        setHasLiked(data.liked)
        setLikesCount(data.count || 0)

        // Send notification when liked
        if (data.liked) {
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "diary",
              message: `${currentUserName} đã thả tim cho nhật ký "${entry.title}" ❤️`,
              author: currentUserName,
              target: entry.author,
              link: "/shared-diary",
            }),
          })
        }
      } else {
        console.error("Like failed:", await res.text())
      }
    } catch (err) {
      console.error("Error toggling like:", err)
    }
  }

  const imageUrl = entry.image || entry.image_url || null

  return (
    <div className="bg-white rounded-2xl shadow p-4 mb-4 relative">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User size={18} className="text-gray-500" />
          <span className="text-sm text-gray-700 font-medium">
            {entry.user_name || entry.author || "Người dùng"}
          </span>
        </div>
        {/* Chỉ hiển thị nút xóa nếu người dùng hiện tại là tác giả */}
        {(entry.author === currentUserName || entry.user_name === currentUserName) && (
          <button onClick={onDelete} className="text-red-500 hover:text-red-700">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <h3 className="font-semibold text-lg mb-1">{entry.title}</h3>
      <p className="text-gray-700 mb-3 whitespace-pre-line">{entry.content}</p>

      {imageUrl && (
        <div className="relative w-full h-64 mb-3 rounded-xl overflow-hidden bg-gray-100">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Đang tải ảnh...
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
              Không tải được ảnh
            </div>
          )}
          {!imageError && (
            <Image
              src={imageUrl}
              alt="Diary Image"
              fill
              className={`object-cover transition-opacity duration-500 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>
      )}

      <div className="flex items-center space-x-4 text-gray-600">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-1 ${hasLiked ? "text-pink-500" : "text-gray-600"}`}
        >
          <Heart size={18} fill={hasLiked ? "currentColor" : "none"} />
          <span>{likesCount}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1">
          <MessageCircle size={18} />
          <span>{commentsCount}</span>
          {showComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      {showComments && (
        <DiaryCommentsSection 
          entryId={entry.id} 
          currentUserName={currentUserName}
          entry={entry}
          onCommentAdded={() => {
            setCommentsCount((prev) => prev + 1)
          }}
        />
      )}
    </div>
  )
}

export default memo(DiaryCard)
