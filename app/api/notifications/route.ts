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
    
    // Nếu có user, chỉ lấy thông báo có target = user hoặc author = user
    if (user) {
      query = query.or(`target.eq.${user},author.eq.${user}`)
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
