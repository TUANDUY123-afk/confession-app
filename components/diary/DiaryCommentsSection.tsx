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
    loadComments()
  }, [entryId])

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/diary-comments?entryId=${entryId}`)
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
            message: `${currentUser?.name || "Ẩn danh"} đã bình luận trong nhật ký "${entry?.title || "của bạn"}" 💬`,
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
      return date.toLocaleString("vi-VN")
    } catch {
      return "Ngày không xác định"
    }
  }

  return (
    <div className="bg-white/80 rounded-2xl shadow-md p-4 mt-4 border border-pink-200">
      <h3 className="font-semibold text-pink-600 mb-3">💬 Bình luận</h3>

      {/* Comment input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          placeholder="Viết bình luận..."
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-300 text-sm"
        />
        <button
          onClick={handleAddComment}
          className="px-4 py-2 rounded-lg bg-pink-500 text-white text-sm hover:bg-pink-600 transition-colors"
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
