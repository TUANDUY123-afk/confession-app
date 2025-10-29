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

export async function POST(request: NextRequest) {
  try {
    // Handle both normal JSON and Blob (from sendBeacon)
    let requestBody: { likes: Array<{ photoUrl: string; likeCount: number }> }
    
    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      requestBody = await request.json()
    } else {
      // Handle Blob from sendBeacon
      const blob = await request.blob()
      const text = await blob.text()
      requestBody = JSON.parse(text)
    }
    
    const { likes } = requestBody

    if (!likes || !Array.isArray(likes) || likes.length === 0) {
      return NextResponse.json({ error: "Missing or invalid likes array" }, { status: 400 })
    }

    const results: Array<{ photoUrl: string; likes: number; success: boolean }> = []
    let newLikesCount = 0

    // Process all likes in batch
    for (const { photoUrl, likeCount } of likes) {
      try {
        if (!photoUrl) {
          results.push({ photoUrl: photoUrl || "unknown", likes: 0, success: false })
          continue
        }

        // Get previous like count to determine if this is a new like
        const previousCount = await getLikes(photoUrl)
        const isNewLike = likeCount > previousCount

        await saveLikes(photoUrl, likeCount)

        // Track new likes for awarding points
        if (isNewLike && likeCount > 0) {
          newLikesCount++
        }

        results.push({ photoUrl, likes: likeCount, success: true })
      } catch (error) {
        console.error(`[Batch Like API] Error processing like for ${photoUrl}:`, error)
        results.push({ photoUrl: photoUrl || "unknown", likes: 0, success: false })
      }
    }

    // Award water points for new likes (batch)
    if (newLikesCount > 0) {
      try {
        // Award points for each new like
        for (let i = 0; i < newLikesCount; i++) {
          await addPoints({
            activity_type: 'like_photo',
            points: 3,
            description: 'Like ảnh +3 nước 💧'
          })
        }
        
        // Update like_master achievement once for the batch
        try {
          console.log('[Batch Like API] Updating like_master achievement for', newLikesCount, 'new likes')
          await updateAchievement({
            achievement_type: 'like_master',
            progress_increment: 0, // Will count from database (diary_likes + photo likes)
          })
        } catch (err) {
          console.error('[Batch Like API] Error updating like_master achievement:', err)
        }
      } catch (err) {
        console.error('[Batch Like API] Error awarding water for photo likes:', err)
      }
    }

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[Batch Like API] Error updating likes:", error)
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 })
  }
}

