import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// ⚙️ Tạo Supabase client (chạy server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 🧍‍♂️ POST: thêm người dùng mới (nếu chưa tồn tại)
export async function POST(req: Request) {
  try {
    const { name } = await req.json()
    console.log("👤 [Người dùng] Yêu cầu đăng ký hoặc xác nhận người dùng:", name)

    if (!name || name.trim() === "") {
      console.warn("⚠️ [Người dùng] Thiếu tên người dùng.")
      return NextResponse.json({ error: "Thiếu tên người dùng" }, { status: 400 })
    }

    // Kiểm tra người dùng đã tồn tại chưa
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("name", name)
      .maybeSingle()

    if (existing) {
      console.log("✅ [Người dùng] Người dùng đã tồn tại:", existing)
      return NextResponse.json({ user: existing })
    }

    // Nếu chưa có → thêm mới
    const { data, error } = await supabase
      .from("users")
      .insert([{ name }])
      .select()
      .single()

    if (error) throw error

    console.log("✨ [Người dùng] Đã thêm người dùng mới:", data)
    return NextResponse.json({ user: data })
  } catch (error) {
    console.error("❌ [Lỗi] Khi thêm người dùng:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

// 📋 GET: lấy danh sách tất cả người dùng
export async function GET() {
  try {
    console.log("📡 [Người dùng] Đang tải danh sách người dùng...")
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) throw error

    console.log(`📦 [Người dùng] Đã tải ${data.length} người dùng.`)
    return NextResponse.json({ users: data })
  } catch (error) {
    console.error("❌ [Lỗi] Khi lấy danh sách người dùng:", error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
