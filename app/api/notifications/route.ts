import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 🩷 Lấy danh sách thông báo
export async function GET(req: Request) {
  try {
    const supabase = getSupabase()
    const url = new URL(req.url)
    const user = url.searchParams.get("user")
    
    let data: any[] = []
    let error: any = null
    
    // Filter notifications cho user hiện tại
    // Chỉ show notifications có target = user hoặc không có target (global)
    if (user) {
      // Dùng cách đơn giản: fetch tất cả rồi filter ở ứng dụng
      // Tránh lỗi syntax với .or()
      const { data: allData, error: queryError } = await supabase
        .from("notifications")
        .select("*")
        .order("timestamp", { ascending: false })
      
      if (queryError) {
        console.error("[v0] Error querying notifications:", queryError)
        error = queryError
      } else {
        // Filter manually: target = user HOẶC target IS NULL
        data = (allData || []).filter(
          (n: any) => !n.target || n.target === user
        )
      }
    } else {
      // Không có user filter, lấy tất cả
      const result = await supabase
        .from("notifications")
        .select("*")
        .order("timestamp", { ascending: false })
      
      data = result.data || []
      error = result.error
    }

    if (error) {
      console.error("[v0] Error querying notifications:", error)
      throw error
    }
    
    return NextResponse.json({ notifications: data || [] })
  } catch (error) {
    console.error("[v0] Error getting notifications:", error)
    return NextResponse.json({ error: "Không thể tải danh sách thông báo." }, { status: 500 })
  }
}

// 🩷 Tạo thông báo mới
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { type, message, author, target, link } = await req.json()

    console.log("[v0] Creating notification:", { type, message, author, target, link })

    // Nếu target là "Tất cả" hoặc không có target, gửi cho tất cả user
    if (!target || target === "Tất cả" || target === "Của chúng ta") {
      // Lấy tất cả users
      const { data: users } = await supabase.from("users").select("name")
      const usernames = users?.map(u => u.name).filter(u => u !== author) || []
      
      if (usernames.length > 0) {
        // Tạo thông báo cho từng user
        const notifications = usernames.map(username => ({
          type,
          message,
          author,
          target: username,
          link: link || null,
          read_by: [],
          timestamp: new Date().toISOString(),
        }))
        
        console.log("[v0] Inserting notifications:", notifications.length)
        
        const { data, error } = await supabase.from("notifications").insert(notifications).select()
        
        if (error) {
          console.error("[v0] Supabase insert error:", error)
          throw error
        }
        
        console.log("[v0] Inserted notifications:", data?.length)
        return NextResponse.json({ success: true, sentTo: usernames.length })
      }
    }

    // Nếu có target cụ thể, gửi cho user đó
    const { error } = await supabase.from("notifications").insert([
      {
        type,
        message,
        author,
        target,
        link: link || null,
        read_by: [],
        timestamp: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("[v0] Supabase insert error:", error)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] POST notification error:", err)
    return NextResponse.json({ error: "Không thể tạo thông báo mới." }, { status: 500 })
  }
}
