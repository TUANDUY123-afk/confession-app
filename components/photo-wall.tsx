"use client"

import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload } from "lucide-react"
import { Card } from "@/components/ui/card"
import PhotoCard from "./photo-card"
import FloatingHearts from "./floating-hearts"
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
  
  // Queue để lưu pending likes chờ gửi
  const pendingLikesRef = useRef<Map<string, { photoUrl: string; likeCount: number; originalCount: number; photo: Photo | undefined }>>(new Map())
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isProcessingRef = useRef(false)

  const loadPhotos = useCallback(async () => {
    try {
      // OPTIMIZED: No cache to get fresh data with likes/comments
      const response = await fetch("/api/list-photos", { 
        cache: 'no-store',
        next: { revalidate: 0 }
      })
      if (!response.ok) {
        console.error("loadPhotos: Response not ok", response.status)
        setPhotos([])
        return
      }
      const data = await response.json().catch(err => {
        console.error("loadPhotos: JSON parse error", err)
        return { photos: [] }
      })

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

  // Hàm gửi batch likes lên server
  const sendBatchLikes = useCallback(async () => {
    if (isProcessingRef.current || pendingLikesRef.current.size === 0) {
      return
    }

    isProcessingRef.current = true
    const currentUser = localStorage.getItem("lovable_user") || "Ẩn danh"
    
    // Lấy tất cả pending likes và lưu original states để rollback nếu cần
    const likesToSend = Array.from(pendingLikesRef.current.values())
    const originalStates = new Map<string, number>()
    
    // Lưu lại giá trị gốc (trước khi optimistic update) để rollback
    likesToSend.forEach(({ photoUrl, originalCount }) => {
      originalStates.set(photoUrl, originalCount)
    })

    // Clear pending queue
    pendingLikesRef.current.clear()

    try {
      // Gửi batch request
      const response = await fetch("/api/likes/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          likes: likesToSend.map(({ photoUrl, likeCount }) => ({
            photoUrl,
            likeCount,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Batch like failed")
      }

      const data = await response.json()
      
      // Update UI với giá trị từ server
      if (data.results && Array.isArray(data.results)) {
        setPhotos((prev) =>
          prev.map((p) => {
            const result = data.results.find((r: any) => r.photoUrl === p.url)
            if (result && result.success) {
              return { ...p, likes: result.likes }
            }
            return p
          })
        )

        // Gửi notification cho mỗi photo được like
        for (const { photoUrl, photo } of likesToSend) {
          if (photo) {
            await addNotification({
              type: "like",
              message: `${currentUser} đã thích ảnh "${photo.title || "của bạn"}" ❤️`,
              author: currentUser,
              target: "Tất cả",
              link: "/photo-wall"
            })
          }
        }
      }
    } catch (error) {
      console.error("Error sending batch likes:", error)
      // Rollback: Khôi phục về giá trị cũ nếu API fail
      setPhotos((prev) =>
        prev.map((p) => {
          const originalCount = originalStates.get(p.url)
          if (originalCount !== undefined) {
            return { ...p, likes: originalCount }
          }
          return p
        })
      )
    } finally {
      isProcessingRef.current = false
    }
  }, [photos, addNotification])

  // Cleanup timer và gửi pending likes khi component unmount hoặc trang refresh
  useEffect(() => {
    // Hàm gửi pending likes ngay lập tức (không chờ debounce)
    const flushPendingLikes = async () => {
      if (pendingLikesRef.current.size > 0 && !isProcessingRef.current) {
        // Clear timer nếu có
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current)
          debounceTimerRef.current = null
        }
        // Gửi ngay lập tức
        await sendBatchLikes()
      }
    }

    // Event listener cho beforeunload để gửi pending likes trước khi trang refresh/close
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pendingLikesRef.current.size > 0) {
        // Lấy tất cả pending likes
        const likesToSend = Array.from(pendingLikesRef.current.values())
        const likesData = likesToSend.map(({ photoUrl, likeCount }) => ({
          photoUrl,
          likeCount,
        }))

        // Sử dụng sendBeacon để gửi data trước khi trang unload
        // sendBeacon hỗ trợ Blob với JSON
        const blob = new Blob([JSON.stringify({ likes: likesData })], {
          type: 'application/json',
        })
        navigator.sendBeacon('/api/likes/batch', blob)
      }
    }

    // Thêm event listener
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      // Gửi pending likes trước khi unmount nếu có
      flushPendingLikes()
    }
  }, [sendBatchLikes])

  const handleLike = useCallback((url: string) => {
    const photo = photos.find((p) => p.url === url)
    
    // Lấy giá trị base: nếu đã có trong queue thì dùng likeCount từ queue (đã được tăng),
    // nếu không thì dùng từ state. Lưu originalCount để rollback.
    const existingPending = pendingLikesRef.current.get(url)
    const baseLikes = existingPending?.likeCount ?? (photo?.likes || 0)
    const originalLikes = existingPending?.originalCount ?? (photo?.likes || 0)
    const newLikeCount = baseLikes + 1

    // Optimistic update: Cập nhật UI ngay lập tức
    setPhotos((prev) =>
      prev.map((p) =>
        p.url === url ? { ...p, likes: newLikeCount } : p
      )
    )

    // Thêm vào pending queue (update nếu đã tồn tại)
    // Lưu cả giá trị gốc để rollback nếu cần
    pendingLikesRef.current.set(url, {
      photoUrl: url,
      likeCount: newLikeCount,
      originalCount: originalLikes,
      photo,
    })

    // Clear timer cũ
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set timer mới để gửi sau khi user ngừng nhấn (1 giây - giảm để tránh mất data khi refresh)
    debounceTimerRef.current = setTimeout(() => {
      sendBatchLikes()
    }, 1000)
  }, [photos, sendBatchLikes])

  const handleComment = useCallback(async (url: string, commentText: string) => {
    const currentUser = localStorage.getItem("lovable_user") || "Ẩn danh"
    const photo = photos.find((p) => p.url === url)
    const currentComments = photo?.comments || []
    
    // Tạo comment tạm thời để hiển thị ngay
    const tempComment = {
      id: `temp-${Date.now()}`,
      text: commentText,
      author: currentUser,
      created_at: new Date().toISOString(),
    }

    // Optimistic update: Thêm comment vào UI ngay lập tức
    setPhotos((prev) =>
      prev.map((p) =>
        p.url === url
          ? { ...p, comments: [...currentComments, tempComment] }
          : p
      )
    )

    // Gọi API ngầm trong background
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: url, text: commentText, author: currentUser }),
      })
      
      if (!response.ok) {
        throw new Error("Comment failed")
      }

      // Server đã nhận được tín hiệu, thay thế comment tạm bằng comment thật từ server
      const data = await response.json()
      setPhotos((prev) =>
        prev.map((p) =>
          p.url === url
            ? {
                ...p,
                comments: [
                  ...(p.comments || []).filter((c: any) => c.id !== tempComment.id),
                  data.comment,
                ],
              }
            : p
        )
      )

      // Gửi notification sau khi server phản hồi thành công
      await addNotification({
        type: "comment",
        message: `${currentUser} đã bình luận về ảnh "${photo?.title || "của bạn"}" 💬`,
        author: currentUser,
        target: "Tất cả",
        link: "/photo-wall"
      })
    } catch (error) {
      console.error("Error commenting photo:", error)
      // Rollback: Xóa comment tạm nếu API fail
      setPhotos((prev) =>
        prev.map((p) =>
          p.url === url
            ? { ...p, comments: currentComments }
            : p
        )
      )
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

    // Notification is sent from multi-photo-upload.tsx, so don't send here to avoid duplicates
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
        {/* 💞 Hiệu ứng tim bay */}
        <FloatingHearts />
        
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
