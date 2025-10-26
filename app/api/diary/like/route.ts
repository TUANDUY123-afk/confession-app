import { getSupabaseClient } from "@/lib/supabase-client"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/utils/user"

// 📌 Lấy tổng lượt thích cho 1 bài viết
async function getDiaryLikes(entryId: string): Promise<number> {
  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from("likes")
      .select("like_count")
      .eq("photo_url", `diary:${entryId}`)
      .maybeSingle() // ✅ dùng maybeSingle để tránh lỗi 406

    if (error) {
      console.error("[v0] Error getting diary likes:", error)
      return 0
    }

    // ✅ Nếu chưa có hàng nào -> tự tạo với 0
    if (!data) {
      await supabase.from("likes").insert({
        photo_url: `diary:${entryId}`,
        like_count: 0,
      })
      return 0
    }

    return data.like_count || 0
  } catch (error) {
    console.error("[v0] Error getting diary likes:", error)
    return 0
  }
}

// 📌 Lưu lượt thích mới (hoặc cập nhật)
async function saveDiaryLikes(entryId: string, likeCount: number) {
  try {
    const supabase = getSupabaseClient()
    await supabase.from("likes").upsert(
      {
        photo_url: `diary:${entryId}`,
        like_count: likeCount,
      },
      { onConflict: "photo_url" },
    )
  } catch (error) {
    console.error("[v0] Error saving diary likes:", error)
    throw error
  }
}

// 📍 GET - Lấy số lượt thích
export async function GET(request: NextRequest) {
  try {
    const entryId = request.nextUrl.searchParams.get("entryId")
    if (!entryId) {
      return NextResponse.json({ error: "No entryId provided" }, { status: 400 })
    }

    const likes = await getDiaryLikes(entryId)
    return NextResponse.json({ count: likes })
  } catch (error) {
    console.error("[v0] Error fetching diary likes:", error)
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}

// 📍 POST - Toggle lượt thích
export async function POST(request: NextRequest) {
  try {
    const { entryId, userName } = await request.json()

    if (!entryId || !userName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // Check if user already liked
    const { data: existing } = await supabase
      .from("diary_likes")
      .select("*")
      .eq("entry_id", entryId)
      .eq("user_name", userName)
      .maybeSingle()

    let liked = false
    let currentCount = 0

    if (existing) {
      // Unlike: delete the like
      await supabase.from("diary_likes").delete().eq("id", existing.id)
      liked = false
    } else {
      // Like: add the like
      await supabase.from("diary_likes").insert([
        { entry_id: entryId, user_name: userName }
      ])
      liked = true
    }

    // Get updated count
    const { data: likes } = await supabase
      .from("diary_likes")
      .select("*")
      .eq("entry_id", entryId)

    currentCount = likes?.length || 0

    // Also update the likes table for consistency
    await supabase.from("likes").upsert(
      {
        photo_url: `diary:${entryId}`,
        like_count: currentCount,
      },
      { onConflict: "photo_url" },
    )

    return NextResponse.json({ liked, count: currentCount })
  } catch (error) {
    console.error("[v0] Error updating diary likes:", error)
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
  }
}
