"use client"

import { useState, useEffect, useMemo, useCallback, memo } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useNotifications } from "@/contexts/NotificationContext"
import { Calendar, ChevronLeft, ChevronRight, Heart, Gift, Cake, Flame } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Trash2, Image as ImageIcon, Upload } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"

interface LoveEvent {
  id: string
  title: string
  date: string
  type?: "outing" | "dining" | "travel" | "shopping" | "birthday" | "important" | "cafe" | "chilling" | "netflix"
  image?: string | null
  description?: string
}

interface DayData {
  date: Date
  events: LoveEvent[]
  isToday: boolean
  isCurrentMonth: boolean
}

interface LoveCalendarProps {
  onEventsChange?: () => void
}

function LoveCalendar({ onEventsChange }: LoveCalendarProps) {
  const { addNotification } = useNotifications()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<LoveEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<LoveEvent | null>(null)
  const [selectedDayEvents, setSelectedDayEvents] = useState<LoveEvent[] | null>(null)
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState("")
  const [newEventDate, setNewEventDate] = useState("")
  const [newEventDescription, setNewEventDescription] = useState("")
  const [newEventImage, setNewEventImage] = useState<string | null>(null)
  const [newEventType, setNewEventType] = useState<"outing" | "dining" | "travel" | "shopping" | "birthday" | "important" | "cafe" | "chilling" | "netflix">("outing")
  const [uploadingImage, setUploadingImage] = useState(false)

  // Get first day of month and number of days
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const loadEvents = useCallback(async () => {
    try {
      // Load events from love-events API only
      const eventsRes = await fetch("/api/love-events")
      const { data: loveEventsData } = await eventsRes.json()
      
      // Format love events to match calendar format
      const formattedEvents = (loveEventsData || []).map((e: any) => ({
        id: e.id, // Use original ID (don't add prefix)
        title: e.title,
        date: e.date,
        type: (e.type || "outing") as const,
        image: e.image || null,
        description: e.description || null,
      }))
      
      setEvents(formattedEvents)
    } catch (err) {
      console.error("Error loading events:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load events when month/year changes (not on every render)
  const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`
  useEffect(() => {
    loadEvents()
  }, [monthKey, loadEvents])

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getEventsForDay = (day: number): LoveEvent[] => {
    if (day <= 0 || day > daysInMonth) return []
    
    const date = new Date(year, month, day)
    const dateStr = formatDateString(date)
    
    return events.filter(event => {
      // Only show events with type (love events), not milestones or memories
      if (!event.type || event.type === "milestone" || event.type === "memory") {
        return false
      }
      // event.date is already in YYYY-MM-DD format from database
      return event.date === dateStr
    })
  }

  const getEventIcon = (type?: string) => {
    switch (type) {
      case "outing":
        return <span className="text-xs">🎮</span>
      case "dining":
        return <span className="text-xs">🍽️</span>
      case "travel":
        return <span className="text-xs">✈️</span>
      case "shopping":
        return <span className="text-xs">🛍️</span>
      case "birthday":
        return <span className="text-xs">🎂</span>
      case "important":
        return <span className="text-xs">⭐</span>
      case "cafe":
        return <span className="text-xs">☕</span>
      case "chilling":
        return <span className="text-xs">🌴</span>
      case "netflix":
        return <span className="text-xs">📺</span>
      default:
        return <span className="text-xs">💕</span>
    }
  }

  const getEventColor = (type?: string) => {
    switch (type) {
      case "outing":
        return "bg-purple-500"
      case "dining":
        return "bg-orange-500"
      case "travel":
        return "bg-blue-500"
      case "shopping":
        return "bg-pink-500"
      case "birthday":
        return "bg-red-500"
      case "important":
        return "bg-yellow-500"
      case "cafe":
        return "bg-amber-600"
      case "chilling":
        return "bg-green-500"
      case "netflix":
        return "bg-indigo-500"
      default:
        return "bg-gray-500"
    }
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const handleAddEvent = async () => {
    if (!newEventTitle.trim() || !newEventDate) return
    
    try {
      console.log("Adding event with image:", {
        title: newEventTitle,
        date: newEventDate,
        type: newEventType,
        hasImage: !!newEventImage,
        imageSize: newEventImage?.length || 0
      })
      
      const response = await fetch("/api/love-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newEventDate,
          title: newEventTitle,
          description: newEventDescription,
          image: newEventImage,
          type: newEventType,
        }),
      })
      
      const responseText = await response.text()
      console.log("API Response:", response.status, responseText)
      
      const result = JSON.parse(responseText)
      const { data, error } = result
      
      if (error || !response.ok) {
        console.error("API Error:", error)
        alert(`Lỗi khi thêm sự kiện 😢: ${error || result.error || "Unknown error"}`)
      } else {
        const newEvent: LoveEvent = {
          id: data.id || Date.now().toString(),
          title: newEventTitle,
          date: newEventDate,
          type: newEventType,
          image: newEventImage,
          description: newEventDescription,
        }
        setEvents([...events, newEvent])
        setNewEventTitle("")
        setNewEventDate("")
        setNewEventDescription("")
        setNewEventImage(null)
        setIsAddDialogOpen(false)
        
        // Call callback to refresh EventCountdown
        onEventsChange?.()
        
        // Award points for adding event
        try {
          await fetch("/api/gamification/points", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activity_type: "add_event",
              points: 50,
              description: `Thêm sự kiện "${newEventTitle}"`,
            }),
          })
          
          // Update achievement progress
          await fetch("/api/gamification/achievements", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              achievement_type: "event_on_time",
              progress_increment: 1,
            }),
          })
        } catch (pointError) {
          console.error("Error awarding points:", pointError)
        }
        
        // Send notification to all users
        const currentUser = localStorage.getItem("lovable_user") || "Đôi ta"
        await addNotification({
          type: "event",
          message: `${currentUser} đã thêm sự kiện "${newEventTitle}" vào lịch 📅 (+50 điểm 🎉)`,
          author: currentUser,
          target: "Tất cả",
          link: "/love-story"
        })
      }
    } catch (err) {
      console.error("Error adding event:", err)
      alert("Lỗi khi thêm sự kiện 😢")
    }
  }
  
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File ảnh quá lớn! Vui lòng chọn file nhỏ hơn 10MB.")
        return
      }
      
      setUploadingImage(true)
      try {
        // ✅ Compress image if it's too large (> 2MB)
        let processedFile = file
        if (file.size > 2 * 1024 * 1024) {
          console.log("[Love Story] Compressing large image:", file.size)
          processedFile = await compressImage(file)
        }
        
        // Upload to Supabase Storage
        const formData = new FormData()
        formData.append("file", processedFile)
        
        const response = await fetch("/api/upload-event-image", {
          method: "POST",
          body: formData,
        })
        
        if (!response.ok) {
          throw new Error("Upload failed")
        }
        
        const { url } = await response.json()
        console.log("Image uploaded to:", url)
        setNewEventImage(url)
      } catch (err) {
        console.error("Error uploading image:", err)
        alert("Lỗi khi upload ảnh")
      } finally {
        setUploadingImage(false)
      }
    }
  }
  
  const calcDaysUntil = (date: string) => {
    const today = new Date()
    const eventDate = new Date(date)
    // Sử dụng Math.floor thay vì Math.ceil để không bị lệch 1 ngày
    return Math.floor((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]
  
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  
  const renderCalendarDays = () => {
    const days: DayData[] = []
    const today = new Date()
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({
        date: new Date(year, month, i - startingDayOfWeek + 1),
        events: [],
        isToday: false,
        isCurrentMonth: false,
      })
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const isToday = 
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      
      days.push({
        date,
        events: getEventsForDay(day),
        isToday,
        isCurrentMonth: true,
      })
    }
    
    // Add empty cells to fill the last week
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month, daysInMonth + i),
        events: [],
        isToday: false,
        isCurrentMonth: false,
      })
    }
    
    return days
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-center text-gray-500">Đang tải lịch...</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">Sự Kiện Tình Yêu 💕</h2>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <Button variant="outline" size="sm" onClick={goToToday} className="hidden sm:flex text-xs sm:text-sm">
                Hôm nay
              </Button>
              <Button variant="outline" size="sm" onClick={goToPreviousMonth} className="p-1 sm:p-2">
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToNextMonth} className="p-1 sm:p-2">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
          
          {/* Add Event Button */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sự kiện mới
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm Sự Kiện Mới</DialogTitle>
                <DialogDescription>
                  Tạo sự kiện tình yêu của bạn
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Tiêu đề *</label>
                  <Input
                    value={newEventTitle}
                    onChange={(e) => setNewEventTitle(e.target.value)}
                    placeholder="Tên sự kiện..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Ngày *</label>
                  <Input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    <span className="flex items-center gap-2">
                      Loại sự kiện
                      {getEventIcon(newEventType)}
                      <span className={`px-2 py-0.5 text-xs rounded ${getEventColor(newEventType)} text-white`}>
                        {newEventType === "outing" && "Đi chơi"}
                        {newEventType === "dining" && "Ăn uống"}
                        {newEventType === "travel" && "Du lịch"}
                        {newEventType === "shopping" && "Mua sắm"}
                        {newEventType === "birthday" && "Sinh nhật"}
                        {newEventType === "important" && "Sự kiện quan trọng"}
                        {newEventType === "cafe" && "Cafe"}
                        {newEventType === "chilling" && "Chilling"}
                        {newEventType === "netflix" && "Netflix"}
                      </span>
                    </span>
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full border rounded-lg p-2"
                  >
                    <option value="outing">🎮 Đi chơi</option>
                    <option value="dining">🍽️ Ăn uống</option>
                    <option value="travel">✈️ Du lịch</option>
                    <option value="shopping">🛍️ Mua sắm</option>
                    <option value="birthday">🎂 Sinh nhật</option>
                    <option value="important">⭐ Sự kiện quan trọng</option>
                    <option value="cafe">☕ Cafe</option>
                    <option value="chilling">🌴 Chilling</option>
                    <option value="netflix">📺 Netflix</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Mô tả</label>
                  <Textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder="Thêm mô tả cho sự kiện..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Hình ảnh</label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {uploadingImage ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto"></div>
                        <p className="text-sm text-gray-500 mt-2">Đang upload ảnh...</p>
                      </div>
                    ) : newEventImage ? (
                      <div className="space-y-2">
                        <img src={newEventImage} alt="Preview" className="max-w-full max-h-40 mx-auto rounded" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setNewEventImage(null)}
                        >
                          Xóa ảnh
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer">
                          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500">Click để thêm ảnh (tối đa 10MB)</p>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleAddEvent} className="flex-1">
                  Thêm sự kiện
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Month/Year */}
        <div className="text-center mb-3 sm:mb-4">
          <p className="text-base sm:text-xl font-semibold text-pink-600">
            {monthNames[month]} {year}
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Day names */}
          {dayNames.map((day, idx) => (
            <div key={idx} className="p-1 sm:p-2 text-center font-semibold text-xs sm:text-sm text-gray-600">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {renderCalendarDays().map((dayData, idx) => (
            <div
              key={idx}
              onClick={() => {
                setSelectedDayEvents(dayData.events)
                setSelectedDay(dayData.date)
              }}
              className={`
                min-h-16 sm:min-h-20 p-1 sm:p-2 border border-gray-200 rounded-lg
                ${dayData.isCurrentMonth ? "bg-white" : "bg-gray-50"}
                ${dayData.isToday ? "ring-2 ring-pink-400" : ""}
                cursor-pointer hover:bg-pink-50 transition-colors
              `}
            >
              <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                <span className={`text-xs sm:text-sm font-medium ${dayData.isCurrentMonth ? "text-gray-700" : "text-gray-400"}`}>
                  {dayData.isCurrentMonth ? dayData.date.getDate() : ""}
                </span>
                {dayData.isToday && (
                  <span className="text-[8px] sm:text-xs bg-pink-500 text-white px-0.5 sm:px-1 rounded">Hôm nay</span>
                )}
              </div>
              
              {/* Events */}
              <div className="flex flex-col gap-0.5 pointer-events-none">
                {dayData.events.slice(0, 1).map((event) => (
                  <div
                    key={event.id}
                    className={`${getEventColor(event.type)} text-white rounded px-0.5 py-0 text-[8px] sm:text-[10px] leading-tight hover:opacity-80 transition-opacity truncate`}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayData.events.length > 1 && (
                  <div className="text-[8px] sm:text-[10px] text-gray-500">
                    +{dayData.events.length - 1} sự kiện khác
                  </div>
                )}
                {dayData.events.length === 0 && dayData.isCurrentMonth && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsAddDialogOpen(true)
                      // Use local date format to avoid timezone issues
                      const localDate = formatDateString(dayData.date)
                      setNewEventDate(localDate)
                    }}
                    className="text-[8px] sm:text-[10px] text-gray-300 hover:text-pink-500 cursor-pointer flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Day Events Dialog */}
      {selectedDayEvents && selectedDay && (
        <Dialog open={!!selectedDayEvents} onOpenChange={() => {
          setSelectedDayEvents(null)
          setSelectedDay(null)
        }}>
            <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  Sự kiện ngày {selectedDay.toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </DialogTitle>
                <DialogDescription>
                  {selectedDayEvents.length} sự kiện
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 mt-4 flex-1 overflow-y-auto px-1">
              {selectedDayEvents.map((event, index) => {
                const daysUntil = calcDaysUntil(event.date)
                const isPast = daysUntil < 0
                
                return (
                  <div
                    key={event.id}
                    className="border rounded-lg bg-pink-50 hover:bg-pink-100 transition-colors overflow-hidden"
                  >
                    {/* Event Image */}
                    {event.image && (
                      <div className="mb-0">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full object-contain bg-gray-50"
                          style={{ maxHeight: '400px' }}
                        />
                      </div>
                    )}
                    
                    {/* Event Details */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <h3 className="font-semibold text-gray-800">{event.title}</h3>
                        </div>
                        <button
                          onClick={async () => {
                            if (confirm("Bạn có chắc muốn xóa sự kiện này?")) {
                              try {
                                const eventId = event.id // No need to replace prefix anymore
                                console.log("Deleting event with ID:", eventId)
                                
                                const response = await fetch("/api/love-events", {
                                  method: "DELETE",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ id: eventId }),
                                })
                                
                                const result = await response.json()
                                console.log("Delete response:", response.status, result)
                                
                                if (!response.ok || result.error) {
                                  throw new Error(result.error || "Delete failed")
                                }
                                
                                // Update UI immediately
                                const updatedEvents = events.filter((e) => e.id !== event.id)
                                setEvents(updatedEvents)
                                const dayStr = formatDateString(selectedDay)
                                setSelectedDayEvents(updatedEvents.filter(e => e.date === dayStr))
                                
                                // Call callback to refresh EventCountdown
                                onEventsChange?.()
                                
                                // Send notification to all users (in background)
                                const currentUser = localStorage.getItem("lovable_user") || "Đôi ta"
                                addNotification({
                                  type: "event",
                                  message: `${currentUser} đã xóa sự kiện "${event.title}" khỏi lịch 🗑️`,
                                  author: currentUser,
                                  target: "Tất cả",
                                  link: "/love-story"
                                }).catch(err => console.error("Notification error:", err))
                              } catch (err) {
                                console.error("Error deleting event:", err)
                                alert("Lỗi khi xóa sự kiện")
                              }
                            }
                          }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Event Description */}
                      {event.description && (
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      )}
                    
                      <div className="flex items-center justify-between">
                        <div className="text-xs">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getEventColor(event.type)} text-white`}>
                            {getEventIcon(event.type)}
                            <span>
                              {event.type === "outing" && "Đi chơi"}
                              {event.type === "dining" && "Ăn uống"}
                              {event.type === "travel" && "Du lịch"}
                              {event.type === "shopping" && "Mua sắm"}
                              {event.type === "birthday" && "Sinh nhật"}
                              {event.type === "important" && "Sự kiện quan trọng"}
                              {event.type === "cafe" && "Cafe"}
                              {event.type === "chilling" && "Chilling"}
                              {event.type === "netflix" && "Netflix"}
                            </span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {isPast ? (
                            <span className="text-orange-600">
                              ⏰ Đã qua {Math.abs(daysUntil)} ngày
                            </span>
                          ) : daysUntil === 0 ? (
                            <span className="text-pink-600 font-bold">
                              🎉 Hôm nay!
                            </span>
                          ) : (
                            <span className="text-pink-600">
                              ⏳ Còn {daysUntil} ngày
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {selectedDayEvents.length === 0 && (
                <p className="text-center text-gray-400 py-4">Không có sự kiện nào</p>
              )}
              </div>
            
            <div className="mt-6 flex-shrink-0 border-t pt-4">
              <Button
                onClick={() => {
                  setSelectedDayEvents(null)
                  setSelectedDay(null)
                  setIsAddDialogOpen(true)
                  // Use local date format to avoid timezone issues
                  const localDate = formatDateString(selectedDay)
                  setNewEventDate(localDate)
                }}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm sự kiện cho ngày này
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

    </>
  )
}

export default memo(LoveCalendar)
