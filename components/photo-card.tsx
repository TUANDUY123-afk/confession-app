"use client"

import { useState, memo } from "react"
import Image from "next/image"
import { Heart, MessageCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import PhotoModal from "./photo-modal"

interface PhotoCardProps {
  url: string
  title: string
  uploadedAt?: string
  likes: number
  comments: any[]
  onLike: (url: string) => void
  onComment: (commentText: string) => void
  onDelete: (url: string) => void
}

function PhotoCard({
  url,
  title,
  uploadedAt,
  likes,
  comments,
  onLike,
  onComment,
  onDelete,
}: PhotoCardProps) {
  const [likeAnim, setLikeAnim] = useState(false)
  const [commentAnim, setCommentAnim] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false)

  const imageUrl = url || "/placeholder.png"

  const handleLikeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setLikeAnim(true)
    setTimeout(() => setLikeAnim(false), 400)
    onLike(url)
  }

  const handleCommentClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setCommentAnim(true)
    setTimeout(() => setCommentAnim(false), 300)
    setIsCommentDialogOpen(true)
  }

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(commentText.trim())
      setCommentText("")
      setIsCommentDialogOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Ảnh - Clickable để zoom */}
      <div 
        className="relative w-full h-64 cursor-pointer"
        onClick={() => setIsPhotoModalOpen(true)}
      >
        <Image
          src={imageUrl}
          alt={title || "Ảnh kỷ niệm"}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
      </div>

      {/* Thông tin ảnh */}
      <div className="p-4 flex flex-col items-center gap-3">
        <h3 className="text-lg font-semibold text-gray-800 text-center">
          {title || "Chưa có tiêu đề"}
        </h3>

        {uploadedAt && (
          <p className="text-xs text-gray-400">
            {new Date(uploadedAt).toLocaleDateString("vi-VN")}
          </p>
        )}

        {/* Nút hành động */}
        <div className="flex w-full justify-between gap-3">
          {/* ❤️ Like */}
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 text-xs bg-transparent transition-all duration-200 ${
              likeAnim ? "like-animate btn-glow" : "hover:scale-105"
            }`}
            onClick={handleLikeClick}
          >
            <Heart className="w-4 h-4 mr-1 fill-pink-500 text-pink-500" />
            {likes}
          </Button>

          {/* 💬 Bình luận */}
          <Button
            size="sm"
            variant="outline"
            className={`flex-1 text-xs bg-transparent transition-all duration-200 ${
              commentAnim ? "comment-animate btn-glow" : "hover:scale-105"
            }`}
            onClick={handleCommentClick}
          >
            <MessageCircle className="w-3 h-3 mr-1" />
            Bình luận ({comments?.length || 0})
          </Button>

          {/* 🗑️ Xóa */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs bg-transparent hover:bg-rose-50 hover:scale-105 transition-all duration-200"
            onClick={() => onDelete(url)}
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
          </Button>
        </div>
      </div>

      {/* Dialog bình luận */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Bình luận 💬</DialogTitle>
            <DialogDescription>Tất cả bình luận về ảnh này</DialogDescription>
          </DialogHeader>
          
          {/* Danh sách bình luận cũ */}
          <div className="grid gap-4 py-4 max-h-64 overflow-y-auto">
            {comments && comments.length > 0 ? (
              comments.map((comment: any) => (
                <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold">
                      {comment.author?.[0]?.toUpperCase() || "A"}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{comment.author || "Ẩn danh"}</p>
                      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(comment.created_at || comment.timestamp).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Chưa có bình luận nào</p>
              </div>
            )}
          </div>

          {/* Form viết bình luận mới */}
          <div className="grid gap-4 py-4 border-t">
            <Textarea
              placeholder="Nhập bình luận của bạn..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCommentDialogOpen(false)}>
              Đóng
            </Button>
            <Button onClick={handleSubmitComment} disabled={!commentText.trim()}>
              Gửi bình luận
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal zoom ảnh */}
      <PhotoModal
        isOpen={isPhotoModalOpen}
        photoUrl={imageUrl}
        title={title}
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  )
}

export default memo(PhotoCard)
