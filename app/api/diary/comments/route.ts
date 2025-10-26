import { getSupabaseClient } from "@/lib/supabase-client"
import { NextRequest, NextResponse } from "next/server"

// 📍 GET - Lấy số lượng comments
export async function GET(request: NextRequest) {
  try {
    const entryId = request.nextUrl.searchParams.get("entryId")
    if (!entryId) {
      return NextResponse.json({ error: "No entryId provided" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // Get comments where id starts with "comment-{entryId}-"
    const { data, error } = await supabase
      .from("diary_entries")
      .select("id")
      .like("id", `comment-${entryId}-%`)

    if (error) {
      console.error("[v0] Error getting diary comments count:", error)
      return NextResponse.json({ count: 0 })
    }

    const count = data?.length || 0
    return NextResponse.json({ count })
  } catch (error) {
    console.error("[v0] Error fetching diary comments count:", error)
    return NextResponse.json({ error: "Failed to fetch comments count" }, { status: 500 })
  }
}

// 📍 POST - Tạo comment mới
export async function POST(request: NextRequest) {
  try {
    const { entryId, text, author } = await request.json()

    if (!entryId || !text) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const newComment = {
      id: `${entryId}-comment-${Date.now()}`,
      author: author || "Ẩn danh",
      title: "",
      content: text,
      mood: null,
      date: new Date().toISOString(),
    }

    await supabase.from("diary_entries").insert([newComment])

    return NextResponse.json({ success: true, comment: newComment })
  } catch (error) {
    console.error("[v0] Error creating diary comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}

