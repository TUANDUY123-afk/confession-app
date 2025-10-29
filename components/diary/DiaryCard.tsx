"use client"

import { useState, useEffect, memo } from "react"
import { Trash2, Heart, MessageCircle, ChevronDown, ChevronUp, User, Edit } from "lucide-react"
import Image from "next/image"
import DiaryCommentsSection from "./DiaryCommentsSection"

// Helper to normalize date from various formats
function normalizeDate(dateValue: any): Date | null {
  if (!dateValue) return null
  
  // If already a Date object
  if (dateValue instanceof Date) {
    return isNaN(dateValue.getTime()) ? null : dateValue
  }
  
  // If it's a string, try to parse
  if (typeof dateValue === 'string') {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  // If it's a number (timestamp)
  if (typeof dateValue === 'number') {
    const date = new Date(dateValue)
    if (!isNaN(date.getTime())) {
      return date
    }
  }
  
  return null
}

// Format date to show posting time
function formatDate(dateValue: any) {
  try {
    if (!dateValue) return ""
    
    let date: Date
    
    // Parse the date value - ensure it's treated as UTC
    if (typeof dateValue === 'string') {
      // Ensure UTC parsing - if no timezone, treat as UTC
      let dateStr = dateValue
      if (!dateStr.endsWith('Z') && !dateStr.includes('+') && !dateStr.includes('-', 10)) {
        // If it's an ISO-like string without timezone, append Z
        if (dateStr.includes('T')) {
          dateStr = dateStr + 'Z'
        }
      }
      date = new Date(dateStr)
    } else if (dateValue instanceof Date) {
      date = dateValue
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue)
    } else {
      date = new Date(dateValue)
    }
    
    if (isNaN(date.getTime())) {
      console.warn("Invalid date:", dateValue)
      return ""
    }
    
    // Format in Vietnam timezone (UTC+7)
    // The date object represents UTC time
    // toLocaleString with timeZone converts it to VN time automatically
    const result = date.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    })
    
    // Debug: Uncomment to see what's happening
    // console.log("Format date:", { original: dateValue, parsed: date.toISOString(), formatted: result })
    
    return result
  } catch (error) {
    console.error("Error formatting date:", error, dateValue)
    return ""
  }
}

interface DiaryCardProps {
  entry: any
  onDelete: () => void
  onEdit?: () => void
  currentUserName: string
  onRefresh?: () => void
}

function DiaryCard({ entry, onDelete, onEdit, currentUserName, onRefresh }: DiaryCardProps) {
  const [showComments, setShowComments] = useState(false)
  // OPTIMIZED: Get initial values from entry props (loaded from main API)
  const [likesCount, setLikesCount] = useState(entry.likesCount || 0)
  const [commentsCount, setCommentsCount] = useState(entry.commentsCount || 0)
  const [hasLiked, setHasLiked] = useState(entry.hasLiked || false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Sync state with entry props when they change
  useEffect(() => {
    if (entry.hasLiked !== undefined) {
      setHasLiked(entry.hasLiked)
    }
    if (entry.likesCount !== undefined) {
      setLikesCount(entry.likesCount)
    }
    if (entry.commentsCount !== undefined) {
      setCommentsCount(entry.commentsCount)
    }
  }, [entry.hasLiked, entry.likesCount, entry.commentsCount])

  // OPTIMIZED: Only fetch if data not provided in entry
  useEffect(() => {
    if (!entry.likesCount && !entry.commentsCount) {
      // Fallback: fetch if not preloaded
      const timeoutId = setTimeout(async () => {
        try {
          const [likesRes, commentsRes] = await Promise.all([
            fetch(`/api/diary/like?entryId=${entry.id}&userName=${currentUserName}`, { 
              cache: 'no-store'
            }),
            fetch(`/api/diary/comments?entryId=${entry.id}`, { 
              cache: 'no-store' 
            }),
          ])

          if (!likesRes.ok || !commentsRes.ok) {
            throw new Error("API returned non-OK status")
          }

          const likesData = await likesRes.json()
          const commentsData = await commentsRes.json()

          setLikesCount(likesData.count || 0)
          setHasLiked(likesData.likedByCurrentUser || false)
          setCommentsCount(commentsData.count || 0)
        } catch (err) {
          console.error("Error fetching likes/comments:", err)
        }
      }, 100)

      return () => clearTimeout(timeoutId)
    }
  }, [entry.id, currentUserName, entry.likesCount, entry.commentsCount])

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
              message: `${currentUserName} đã thả tim cho nhật ký "${entry.title}" ❤️ (+3 nước 💧)`,
              author: currentUserName,
              target: entry.author,
              link: "/shared-diary",
            }),
          })
        }
        
        // Refresh parent component
        if (onRefresh) {
          onRefresh()
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
    <div className="bg-white rounded-3xl shadow-xl p-6 relative border-2 border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-300 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <User size={18} className="text-white" />
          </div>
          <div>
            <span className="text-sm text-gray-800 font-bold">
              {entry.user_name || entry.author || "Người dùng"}
            </span>
          </div>
        </div>
        {/* Chỉ hiển thị nút sửa/xóa nếu người dùng hiện tại là tác giả */}
        {(entry.author === currentUserName || entry.user_name === currentUserName) && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={onEdit} className="text-blue-500 hover:text-blue-700" title="Sửa">
                <Edit size={18} />
              </button>
            )}
            <button onClick={onDelete} className="text-red-500 hover:text-red-700" title="Xóa">
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {(entry.date || entry.created_at) && (
        <div className="mb-3 mt-1">
          <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            {formatDate(entry.date || entry.created_at)}
          </span>
        </div>
      )}

      {/* Mood Badge */}
      {entry.mood && (
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 text-sm font-semibold text-gray-700 border border-purple-200">
            {entry.mood}
          </span>
        </div>
      )}
      
      <h3 className="font-black text-2xl mb-3 text-gray-800 leading-tight">{entry.title}</h3>
      <p className="text-gray-600 mb-5 whitespace-pre-line leading-relaxed">{entry.content}</p>

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

      <div className="flex items-center space-x-4 pt-4 border-t-2 border-gray-100">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl transition-all font-semibold ${
            hasLiked 
              ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg scale-105" 
              : "hover:bg-pink-50 text-gray-600 hover:scale-105"
          }`}
        >
          <Heart 
            size={22} 
            fill={hasLiked ? "currentColor" : "none"} 
            className={`transition-all ${hasLiked ? "text-white animate-pulse" : ""}`} 
          />
          <span>{likesCount}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)} 
          className="flex items-center space-x-2 px-5 py-2.5 rounded-2xl hover:bg-purple-50 text-gray-600 transition-all hover:scale-105"
        >
          <MessageCircle size={22} />
          <span className="font-semibold">{commentsCount}</span>
          {showComments ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {showComments && (
        <DiaryCommentsSection 
          entryId={entry.id} 
          currentUserName={currentUserName}
          entry={entry}
          onCommentAdded={() => {
            setCommentsCount((prev) => prev + 1)
            // Refresh parent to show latest data
            if (onRefresh) onRefresh()
          }}
        />
      )}
    </div>
  )
}

export default memo(DiaryCard)
