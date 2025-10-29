import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"

async function getLikes(photoUrl: string): Promise<number> {
  try {
    const supabase = getSupabaseClient()
    const { data: result, error } = await supabase.from("likes").select("like_count").eq("photo_url", photoUrl)

    if (error) {
      console.error("[v0] Error getting likes:", error)
      return 0
    }

    return result && result.length > 0 ? result[0].like_count : 0
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
      },
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
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gamification/points`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity_type: 'like_photo',
            points: 3,
            description: 'Like ảnh +3 nước 💧'
          })
        })
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
