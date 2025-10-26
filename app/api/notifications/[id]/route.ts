import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// 🩵 Đánh dấu đã đọc
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json().catch(() => ({}))
    const { read_by } = body

    console.log(`PATCH /notifications/${id} with read_by:`, read_by)

    // ✅ Chuẩn hóa read_by thành mảng thật
    const parsedReadBy = Array.isArray(read_by)
      ? read_by
      : typeof read_by === "string"
      ? JSON.parse(read_by)
      : []

    console.log("Parsed read_by:", parsedReadBy)

    const supabase = getSupabase()
    
    // ✅ Lấy dữ liệu hiện tại — tránh lỗi 406 nếu không có dòng
    const { data: existingData, error: selectError } = await supabase
      .from("notifications")
      .select("read_by")
      .eq("id", id)
      .maybeSingle()

    if (selectError) {
      console.warn("Select error:", selectError.message)
      throw selectError
    }

    const existingReadBy: string[] = existingData?.read_by || []
    console.log("Existing read_by:", existingReadBy)

    // ✅ Gộp người đọc mới vào danh sách cũ (loại trùng)
    const updatedReadBy = Array.from(new Set([...existingReadBy, ...parsedReadBy]))
    console.log("Updated read_by:", updatedReadBy)

    const { error: updateError } = await supabase
      .from("notifications")
      .update({
        read_by: updatedReadBy,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (updateError) {
      console.error("Update error:", updateError)
      console.error("Notification ID:", id)
      console.error("Update data:", { read_by: updatedReadBy })
      throw updateError
    }

    console.log("Successfully updated notification:", id)
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("PATCH /notifications/[id] error:", err)
    const errorMessage = err?.message || String(err)
    const errorCode = err?.code || "UNKNOWN"
    console.error("Error details:", { errorMessage, errorCode, notificationId: id })
    return NextResponse.json({ 
      error: "Không thể cập nhật thông báo.", 
      details: errorMessage,
      code: errorCode
    }, { status: 500 })
  }
}

// 🩵 Xóa 1 hoặc tất cả thông báo
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = getSupabase()

    if (id === "all") {
      await supabase.from("notifications").delete().neq("id", "")
      return NextResponse.json({ success: true, message: "Đã xóa tất cả thông báo khỏi server." })
    } else {
      await supabase.from("notifications").delete().eq("id", id)
      return NextResponse.json({ success: true, message: "Đã xóa thông báo khỏi server." })
    }
  } catch (err) {
    console.error("DELETE /notifications/[id] error:", err)
    return NextResponse.json({ error: "Không thể xóa thông báo." }, { status: 500 })
  }
}
