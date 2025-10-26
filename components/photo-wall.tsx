"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import PhotoCard from "./photo-card"
import dynamic from "next/dynamic"
import { useNotifications } from "@/contexts/NotificationContext"

const MultiPhotoUpload = dynamic(() => import("./multi-photo-upload"), { ssr: false })

interface Photo {
  url: string
  title: string
  uploadedAt: string
  likes?: number
  comments?: { author: string; text: string; created_at: string }[]
}

export default function PhotoWall() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [showMultiUpload, setShowMultiUpload] = useState(false)
  const router = useRouter()
  const { addNotification } = useNotifications()

  const loadPhotos = useCallback(async () => {
    try {
      const response = await fetch("/api/list-photos")
      const data = await response.json()

      const formatted = (data.photos || []).map((p: any) => ({
        url: p.url,
        title: p.title,
        uploadedAt: p.uploaded_at
          ? new Date(p.uploaded_at).toISOString()
          : new Date().toISOString(),
        likes: p.likes || 0,
        comments: p.comments || [],
      }))

      setPhotos(formatted)
    } catch (error) {
      console.error("Error loading photos:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPhotos()
  }, [loadPhotos])

  const handleDelete = useCallback(async (url: string) => {
    if (!confirm("Bạn có chắc muốn xóa ảnh này không?")) return
    try {
      const response = await fetch("/api/delete-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      })
      if (!response.ok) throw new Error("Không thể xóa ảnh")
      setPhotos((prev) => prev.filter((p) => p.url !== url))
    } catch (error) {
      console.error("Error deleting photo:", error)
      alert("Xóa ảnh thất bại, vui lòng thử lại.")
    }
  }, [photos, addNotification])

  const handleLike = useCallback(async (url: string) => {
    try {
      const currentUser = localStorage.getItem("lovable_user") || "Ẩn danh"
      // Get current like count
      const currentLikes = photos.find((p) => p.url === url)?.likes || 0
      const newLikeCount = currentLikes + 1

      const response = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url, likeCount: newLikeCount }),
      })
      if (!response.ok) throw new Error("Like failed")
      setPhotos((prev) =>
        prev.map((p) =>
          p.url === url ? { ...p, likes: newLikeCount } : p
        )
      )

      // Send notification
      const photo = photos.find((p) => p.url === url)
      await addNotification({
        type: "like",
        message: `${currentUser} đã thích ảnh "${photo?.title || "của bạn"}" ❤️`,
        author: currentUser,
        target: "Tất cả",
        link: "/photo-wall"
      })
    } catch (error) {
      console.error("Error liking photo:", error)
    }
  }, [photos, addNotification])

  const handleComment = useCallback(async (url: string, commentText: string) => {
    try {
      const currentUser = localStorage.getItem("lovable_user") || "Ẩn danh"
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url, text: commentText, author: currentUser }),
      })
      if (!response.ok) throw new Error("Comment failed")
      
      // Reload specific photo to get updated comments
      const photoResponse = await fetch(`/api/list-photos`)
      const photoData = await photoResponse.json()
      const updatedPhoto = photoData.photos?.find((p: Photo) => p.url === url)
      
      if (updatedPhoto) {
        setPhotos((prev) =>
          prev.map((p) => (p.url === url ? updatedPhoto : p))
        )
      } else {
        // Fallback: add comment to state
        const data = await response.json()
        setPhotos((prev) =>
          prev.map((p) =>
            p.url === url
              ? { ...p, comments: [...(p.comments || []), data.comment] }
              : p
          )
        )
      }

      // Send notification
      const photo = photos.find((p) => p.url === url)
      await addNotification({
        type: "comment",
        message: `${currentUser} đã bình luận về ảnh "${photo?.title || "của bạn"}" 💬`,
        author: currentUser,
        target: "Tất cả",
        link: "/photo-wall"
      })
    } catch (error) {
      console.error("Error commenting photo:", error)
    }
  }, [photos, addNotification])

  const handleTitleUpdate = useCallback((url: string, newTitle: string) => {
    setPhotos((prev) => prev.map((p) => (p.url === url ? { ...p, title: newTitle } : p)))
  }, [])

  const handlePhotoUploaded = useCallback(async (photoUrl: string, title: string) => {
    setPhotos((prev) => [
      {
        url: photoUrl,
        title,
        uploadedAt: new Date().toISOString(),
        likes: 0,
        comments: [],
      },
      ...prev,
    ])

    // Send notification
    const currentUser = localStorage.getItem("lovable_user") || "Ẩn danh"
    await addNotification({
      type: "photo",
      message: `${currentUser} đã đăng ảnh mới "${title}" 📸`,
      author: currentUser,
      target: "Tất cả",
      link: "/photo-wall"
    })
  }, [addNotification])

  // Memoize sorted photos to avoid recalculation
  const sortedPhotos = useMemo(() => {
    return [...photos].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    )
  }, [photos])

  return (
    <>
      {/* Nền tường ảnh */}
      <div
        className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-blue-50 
                   py-12 px-4 md:px-8 relative overflow-hidden transition-all duration-500"
      >
        {/* Nút quay lại */}
        <div className="absolute top-6 left-6 z-40">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 bg-white/70 backdrop-blur-md border border-pink-200 
                       text-pink-600 font-semibold px-4 py-2 rounded-full shadow-md 
                       hover:shadow-pink-200 hover:bg-white transition-all 
                       hover:scale-105 active:scale-95 animate-pulse-slow"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </button>
        </div>

        {/* Nút tải ảnh */}
        <div className="fixed bottom-20 left-6 z-40">
          <button
            onClick={() => setShowMultiUpload(true)}
            className="cursor-pointer bg-gradient-to-r from-pink-500 to-rose-400
             hover:from-pink-600 hover:to-rose-500 text-white rounded-full
             shadow-md hover:shadow-pink-200 transition-all hover:scale-105
             w-12 h-12 flex items-center justify-center text-lg animate-glow"
            title="Tải ảnh mới"
          >
            <Upload className="w-5 h-5" />
          </button>
        </div>

        {/* Tiêu đề */}
        <div className="text-center mb-10 mt-20">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 bg-clip-text text-transparent mb-2 animate-fade-in">
            Tường Ảnh Của Chúng Mình ✨
          </h1>
          <p className="text-muted-foreground text-lg animate-fade-in-delay">
            Những kỷ niệm đẹp chúng ta chia sẻ 💕
          </p>
        </div>

        {/* Lưới ảnh */}
        {loading ? (
          <p className="text-center text-gray-500">Đang tải ảnh...</p>
        ) : photos.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 hover:border-primary/40 transition-colors">
            <p className="text-muted-foreground text-lg">
              Chưa có ảnh nào. Hãy tải lên kỷ niệm đầu tiên của bạn! 📸
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedPhotos.map((photo) => (
              <PhotoCard
                key={photo.url}
                url={photo.url}
                title={photo.title}
                uploadedAt={photo.uploadedAt}
                likes={photo.likes || 0}
                comments={photo.comments || []}
                onDelete={() => handleDelete(photo.url)}
                onLike={() => handleLike(photo.url)}
                onComment={(commentText) => handleComment(photo.url, commentText)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal tải ảnh */}
      {showMultiUpload && (
        <MultiPhotoUpload
          onUploadComplete={() => {
            setShowMultiUpload(false)
            loadPhotos()
          }}
          onPhotoUploaded={handlePhotoUploaded}
          onClose={() => setShowMultiUpload(false)}
        />
      )}
    </>
  )
}
