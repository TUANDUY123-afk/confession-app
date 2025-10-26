"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ImageIcon, Pencil, Loader2 } from "lucide-react"
import NextImage from "next/image"
import { useNotifications } from "@/contexts/NotificationContext"
import { getCurrentUser } from "@/utils/user"
import { createClient } from "@supabase/supabase-js"

interface SelectedPhoto {
  file: File
  preview: string
  title: string
}

interface MultiPhotoUploadProps {
  onUploadComplete: () => void
  onPhotoUploaded?: (photoUrl: string, title: string) => void
  onClose: () => void
}

export default function MultiPhotoUpload({
  onUploadComplete,
  onPhotoUploaded,
  onClose,
}: MultiPhotoUploadProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [hasClicked, setHasClicked] = useState(false)
  const [currentUserName, setCurrentUserName] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ✅ Lấy hàm thông báo & thông tin người dùng
  const { addNotification } = useNotifications()

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getCurrentUser()
      if (user?.name) {
        setCurrentUserName(user.name)
      }
    }
    fetchUser()
  }, [])

  useEffect(() => {
    // Only click once on mount
    if (!hasClicked) {
      fileInputRef.current?.click()
      setHasClicked(true)
    }
  }, [hasClicked])

  // ✅ Function to compress image
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height
          
          // Calculate new dimensions
          if (width > maxWidth) {
            height = (maxWidth / width) * height
            width = maxWidth
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                })
                console.log(`[Compress] Original: ${(file.size / 1024 / 1024).toFixed(2)}MB -> Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
                resolve(compressedFile)
              } else {
                resolve(file)
              }
            },
            'image/jpeg',
            quality
          )
        }
        img.onerror = reject
      }
      reader.onerror = reject
    })
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const newPhotos: SelectedPhoto[] = []
    
    for (const file of files) {
      if (file.type.startsWith("image/")) {
        try {
          console.log("[Upload] Processing file:", file.name, "type:", file.type, "size:", file.size)
          
          // ✅ Compress image if it's too large (> 2MB)
          let processedFile = file
          if (file.size > 2 * 1024 * 1024) {
            console.log("[Compress] Compressing large file:", file.size)
            processedFile = await compressImage(file)
          }
          
          // Create preview
          const reader = new FileReader()
          reader.onload = (event) => {
            const preview = event.target?.result as string
            newPhotos.push({
              file: processedFile,
              preview,
              title: file.name.replace(/\.[^/.]+$/, ""),
            })
            
            if (newPhotos.length === files.length) {
              setSelectedPhotos(newPhotos)
              setShowPreview(true)
            }
          }
          reader.readAsDataURL(processedFile)
        } catch (err) {
          console.error("Error processing file:", file.name, err)
        }
      }
    }

    e.target.value = ""
  }

  const removePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const updatePhotoTitle = (index: number, title: string) => {
    setSelectedPhotos((prev) => {
      const updated = [...prev]
      updated[index].title = title
      return updated
    })
  }

  const handleUpload = async () => {
    if (selectedPhotos.length === 0) return
    try {
      setUploading(true)
      setError("")

      for (const photo of selectedPhotos) {
        console.log("[Upload] Starting upload via API route:", photo.file.name, photo.file.size, "type:", photo.file.type)
        
        // ✅ Upload through API route (like v12) - uses service role key
        const formData = new FormData()
        formData.append("file", photo.file)
        formData.append("title", photo.title)
        
        const response = await fetch("/api/upload-photo", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
          throw new Error(errorData.error || "Upload failed")
        }

        const { url: uploadedUrl, title: uploadedTitle } = await response.json()
        console.log("[Upload] Success:", uploadedUrl)
        
        onPhotoUploaded?.(uploadedUrl, uploadedTitle)
      }

      // ✅ Gửi thông báo sau khi tải ảnh thành công (chỉ 1 lần cho toàn bộ upload)
      const userName = currentUserName || "Người yêu"
      await addNotification({
        type: "photo",
        message: `${userName} đã đăng ${selectedPhotos.length > 1 ? selectedPhotos.length + ' bức ảnh mới' : 'một bức ảnh mới'} 📸`,
        author: userName,
        target: "Tất cả",
        link: "/photo-wall"
      })

      setSelectedPhotos([])
      setShowPreview(false)
      onUploadComplete()
      onClose()
      } catch (err) {
        console.error("[Upload Error] Details:", err)
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(`Không thể tải lên ảnh 😢: ${errorMessage}`)
        alert(`Upload failed: ${errorMessage}`)
      } finally {
        setUploading(false)
      }
  }

  if (!showPreview) {
    return (
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative transition-all animate-scale-up">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-pink-200/40 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-pink-600 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-pink-500" />
            Xem Trước Ảnh ({selectedPhotos.length})
          </h2>
          <button
            onClick={() => {
              setShowPreview(false)
              setSelectedPhotos([])
              onClose()
            }}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Preview grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {selectedPhotos.map((photo, index) => (
            <div
              key={index}
              className="group relative border-2 border-pink-100 hover:border-pink-300 transition-all rounded-xl overflow-hidden bg-gradient-to-br from-pink-50 to-white shadow-sm hover:shadow-md animate-fade-in"
            >
              <div className="relative w-full aspect-square">
                <NextImage
                  src={photo.preview}
                  alt={`Preview ${index}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-2 left-2 bg-white/80 text-pink-600 px-2 py-1 rounded-full text-xs font-semibold shadow-md flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" /> Ảnh {index + 1}
                </div>
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 bg-white/80 text-red-500 hover:bg-red-500 hover:text-white p-1 rounded-full shadow transition"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-3 border-t border-pink-100">
                <div className="flex items-center gap-2">
                  <Pencil className="w-4 h-4 text-pink-500" />
                  <input
                    type="text"
                    value={photo.title}
                    onChange={(e) => updatePhotoTitle(index, e.target.value)}
                    placeholder="Nhập tiêu đề ảnh..."
                    className="flex-1 text-sm px-3 py-1.5 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-300 outline-none transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-pink-200 px-6 py-4 flex gap-4">
          <Button
            onClick={() => {
              setShowPreview(false)
              setSelectedPhotos([])
              onClose()
            }}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold"
            disabled={uploading}
          >
            Hủy
          </Button>

          <Button
            onClick={handleUpload}
            className="flex-1 bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-semibold rounded-lg"
            disabled={uploading}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tải lên...
              </span>
            ) : (
              `📤 Đăng ${selectedPhotos.length} Ảnh`
            )}
          </Button>
        </div>

        {error && <p className="text-center text-red-500 py-3 font-semibold">{error}</p>}
      </div>
    </div>
  )
}
