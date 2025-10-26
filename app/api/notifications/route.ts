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
    
    let query = supabase.from("notifications").select("*")
    
    // Nếu có user, lấy tất cả thông báo (không filter)
    // User sẽ thấy tất cả notifications từ mọi người
    // Không cần filter vì muốn tất cả user thấy tất cả notifications
    if (user) {
      query = query // Không filter, để tất cả user thấy tất cả notifications
    }
    
    const { data, error } = await query.order("timestamp", { ascending: false })

    if (error) throw error
    
    // Log để debug
    if (data && data.length > 0) {
      console.log("Fetched notifications sample:", data[0])
    }
    
    return NextResponse.json({ notifications: data || [] })
  } catch {
    return NextResponse.json({ error: "Không thể tải danh sách thông báo." }, { status: 500 })
  }
}

// 🩷 Tạo thông báo mới
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const { type, message, author, target, link } = await req.json()

    console.log("Creating notification with:", { type, message, author, target, link })

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
        
        console.log("[API] Inserting notifications:", notifications.length)
        
        const { data, error } = await supabase.from("notifications").insert(notifications).select()
        
        if (error) {
          console.error("Supabase insert error:", error)
          throw error
        }
        
        console.log("[API] Inserted notifications:", data?.length)
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
      console.error("Supabase insert error:", error)
      throw error
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("POST notification error:", err)
    return NextResponse.json({ error: "Không thể tạo thông báo mới." }, { status: 500 })
  }
}
