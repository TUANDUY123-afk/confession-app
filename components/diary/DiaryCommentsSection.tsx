"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import { getCurrentUser } from "@/utils/user"

interface Comment {
  id: string
  content: string
  author: string
  created_at: string
}

export default function DiaryCommentsSection({
  entryId,
  onCommentAdded,
  entry,
}: {
  entryId: string
  onCommentAdded: () => void
  entry?: any
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      setCurrentUser(user)
    }
    fetchUser()
  }, [])

  useEffect(() => {
    // Debounce loading comments
    const timeoutId = setTimeout(() => {
      loadComments()
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [entryId])

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/diary-comments?entryId=${entryId}`, { cache: 'force-cache' })
      const data = await res.json()
      if (data.comments) setComments(data.comments)
    } catch (error) {
      console.error("[Error loading comments]", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    if (!currentUser) {
      alert("Không thể xác định người dùng 😢")
      return
    }

    try {
      const res = await fetch("/api/diary-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entryId,
          text: newComment,
          author: currentUser?.name || "Ẩn danh",
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Add new comment to the END of the array (oldest first)
        const newCommentData = {
          id: data.comment.id,
          content: data.comment.content || data.comment.text,
          author: data.comment.author,
          created_at: data.comment.created_at || data.comment.timestamp
        }
        setComments([...comments, newCommentData])
        setNewComment("")
        onCommentAdded()

        // Send notification
        try {
          const entryAuthor = entry?.author || "Đôi ta"
          await fetch("/api/notifications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "diary",
            message: `${currentUser?.name || "Ẩn danh"} đã bình luận trong nhật ký "${entry?.title || "của bạn"}" 💬 (+5 nước 💧)`,
            author: currentUser?.name || "Ẩn danh",
            target: entryAuthor,
            link: "/shared-diary",
          }),
          })
        } catch (notifError) {
          console.error("Failed to send notification:", notifError)
        }
      } else {
        console.error("[Add comment] Server returned error")
      }
    } catch (error) {
      console.error("[Error adding comment]", error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      await fetch("/api/diary-comments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      })
      setComments(comments.filter((c) => c.id !== commentId))
      onCommentAdded()
    } catch (error) {
      console.error("[Error deleting comment]", error)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      // Format in Vietnam timezone (UTC+7)
      return date.toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "Ngày không xác định"
    }
  }

  return (
    <div className="bg-gradient-to-br from-pink-50 to-white rounded-3xl shadow-md p-5 mt-5 border border-pink-200">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={20} className="text-pink-600" />
        <h3 className="font-bold text-pink-600">Bình luận</h3>
      </div>

      {/* Comment input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="Viết bình luận..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-pink-400 focus:border-transparent text-sm bg-white transition-all"
        />
        <button
          onClick={handleAddComment}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
        >
          Gửi
        </button>
      </div>

      {/* Comments list */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          <p className="text-gray-500 text-sm">Đang tải...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có bình luận nào</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm text-gray-700">{comment.author}</p>
                  <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                </div>
                {comment.author === (currentUser?.name || "") && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-700 mt-2">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
