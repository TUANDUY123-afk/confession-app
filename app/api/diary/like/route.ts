import { getSupabaseClient } from "@/lib/supabase-client"
import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/utils/user"
import { addPoints, updateAchievement } from "@/lib/gamification-helpers"

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

// 📍 GET - Lấy số lượt thích và trạng thái like của user hiện tại
export async function GET(request: NextRequest) {
  try {
    const entryId = request.nextUrl.searchParams.get("entryId")
    const userName = request.nextUrl.searchParams.get("userName")
    
    if (!entryId) {
      return NextResponse.json({ error: "No entryId provided" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // Get total count
    const { count } = await supabase
      .from("diary_likes")
      .select("*", { count: 'exact', head: true })
      .eq("entry_id", entryId)
    
    // Check if current user liked
    let likedByCurrentUser = false
    if (userName) {
      const { data } = await supabase
        .from("diary_likes")
        .select("id")
        .eq("entry_id", entryId)
        .eq("user_name", userName)
        .maybeSingle()
      
      likedByCurrentUser = !!data
    }

    return NextResponse.json({ 
      count: count || 0,
      likedByCurrentUser
    })
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
    
    console.log("[Like API] Existing like check:", existing, "for user:", userName, "entry:", entryId)

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
      
      // Award water points for liking
      // Check if this is a comment or regular diary entry
      const isComment = entryId.startsWith('comment-')
      
      try {
        // Use direct function call instead of HTTP fetch (works on Vercel)
        await addPoints({
          activity_type: isComment ? 'like_comment' : 'like_diary',
          points: isComment ? 2 : 3,
          description: isComment ? 'Like comment +2 nước 💧' : 'Like nhật ký +3 nước 💧'
        })
        
        // Update like_master achievement (only for diary entries, not comments)
        // Note: progress_increment is ignored - achievement counts from database
        if (!isComment) {
          try {
            console.log('[Like Diary API] Updating like_master achievement for entry:', entryId)
            const result = await updateAchievement({
              achievement_type: 'like_master',
              progress_increment: 0, // Will count from database (diary_likes + photo likes)
            })
            console.log('[Like Diary API] Achievement update result:', result)
            console.log('[Like Diary API] New progress:', result?.progress, 'Unlocked levels:', result?.unlockedLevels)
          } catch (err) {
            console.error('[Like Diary API] Error updating like_master achievement:', err)
            // Don't throw - just log the error so it doesn't break the like flow
          }
        }
      } catch (err) {
        console.error('Error awarding water for like:', err)
      }
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
