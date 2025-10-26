import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function POST(request: NextRequest) {
  try {
    const { id, currentUserName } = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    console.log("[Delete] Attempting to delete entry ID:", id)
    console.log("[Delete] Current user:", currentUserName)
    
    // Kiểm tra xem entry có tồn tại không và lấy thông tin author
    const { data: entry, error: fetchError } = await supabase
      .from("diary_entries")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !entry) {
      console.error("[v0] Error fetching entry:", fetchError?.message || "No entry found")
      // List all entries for debug
      const { data: allEntries } = await supabase.from("diary_entries").select("id, title, author, user_name").limit(5)
      console.log("[Delete] Sample entries:", allEntries)
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    console.log("[Delete] Entry found:", { id: entry.id, author: entry.author, user_name: entry.user_name, title: entry.title })

    // Kiểm tra quyền xóa: chỉ author mới được xóa
    const entryAuthor = entry.author || entry.user_name
    
    // So sánh không phân biệt hoa thường
    if (entryAuthor?.toLowerCase() !== currentUserName?.toLowerCase()) {
      console.log("[Delete] Unauthorized delete attempt")
      return NextResponse.json({ error: "You can only delete your own entries" }, { status: 403 })
    }

    // Xóa entry
    const { error } = await supabase.from("diary_entries").delete().eq("id", id)

    if (error) {
      console.error("[v0] Supabase error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting diary entry:", error)
    return NextResponse.json({ error: "Failed to delete entry" }, { status: 500 })
  }
}
