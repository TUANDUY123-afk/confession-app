import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"
import { addPoints, updateAchievement } from "@/lib/gamification-helpers"

async function getLikes(photoUrl: string): Promise<number> {
  try {
    const supabase = getSupabaseClient()
    const { data: result, error } = await supabase.from("likes").select("like_count").eq("photo_url", photoUrl)

    if (error) {
      console.error("[v0] Error getting likes:", error)
      return 0
    }

    return result && result.length > 0 ? (result[0] as any).like_count : 0
  } catch (error) {
    console.error("[v0] Error getting likes:", error)
    return 0
  }
}

async function saveLikes(photoUrl: string, likeCount: number) {
  try {
    const supabase = getSupabaseClient()
    await supabase.from("likes").upsert(
      {
        photo_url: photoUrl,
        like_count: likeCount,
      } as any,
      { onConflict: "photo_url" },
    )
  } catch (error) {
    console.error("[v0] Error saving likes:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const photoUrl = request.nextUrl.searchParams.get("photoUrl")
    if (!photoUrl) {
      return NextResponse.json({ error: "No photoUrl provided" }, { status: 400 })
    }

    const likes = await getLikes(photoUrl)
    return NextResponse.json({ likes })
  } catch (error) {
    console.error("[v0] Error fetching likes:", error)
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, likeCount } = await request.json()

    if (!photoUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get previous like count to determine if this is a new like
    const previousCount = await getLikes(photoUrl)
    const isNewLike = likeCount > previousCount

    await saveLikes(photoUrl, likeCount)

    // Award water points if this is a new like (count increased)
    if (isNewLike && likeCount > 0) {
      try {
        // Use direct function call instead of HTTP fetch (works on Vercel)
        await addPoints({
          activity_type: 'like_photo',
          points: 3,
          description: 'Like ảnh +3 nước 💧'
        })
        
        // Update like_master achievement (photo likes also count)
        // Note: progress_increment is ignored - achievement counts from database
        try {
          console.log('[Like Photo API] Updating like_master achievement for photo:', photoUrl)
          const result = await updateAchievement({
            achievement_type: 'like_master',
            progress_increment: 0, // Will count from database (diary_likes + photo likes)
          })
          console.log('[Like Photo API] Achievement update result:', result)
          console.log('[Like Photo API] New progress:', result?.progress, 'Unlocked levels:', result?.unlockedLevels)
        } catch (err) {
          console.error('[Like Photo API] Error updating like_master achievement:', err)
        }
      } catch (err) {
        console.error('Error awarding water for photo like:', err)
      }
    }

    return NextResponse.json({ likes: likeCount })
  } catch (error) {
    console.error("[v0] Error updating likes:", error)
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
  }
}
