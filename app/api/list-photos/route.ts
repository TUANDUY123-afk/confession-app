import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    let retries = 3
    let lastError: any = null

    while (retries > 0) {
      try {
        const { data: photos, error } = await supabase
          .from("photos")
          .select("url, title, filename, uploaded_at")
          .order("uploaded_at", { ascending: false })

        if (error) {
          lastError = error
          retries--
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            continue
          }
          throw error
        }

        // ✅ OPTIMIZATION: Load all comments and likes in batch
        const photoUrls = photos?.map(p => p.url) || []
        
        // Get all comments for all photos in one query
        const { data: allComments } = await supabase
          .from("comments")
          .select("id, text, author, created_at, photo_url")
          .in("photo_url", photoUrls)
          .order("created_at", { ascending: false })
        
        // Get all likes for all photos in one query
        const { data: allLikes } = await supabase
          .from("likes")
          .select("photo_url, like_count")
          .in("photo_url", photoUrls)

        // Create lookup maps
        const commentsMap = new Map<string, any[]>()
        allComments?.forEach(comment => {
          if (!commentsMap.has(comment.photo_url)) {
            commentsMap.set(comment.photo_url, [])
          }
          commentsMap.get(comment.photo_url)!.push(comment)
        })

        const likesMap = new Map<string, number>()
        allLikes?.forEach(like => {
          likesMap.set(like.photo_url, like.like_count || 0)
        })

        // Combine data
        const photosWithData = (photos || []).map(photo => ({
          ...photo,
          comments: commentsMap.get(photo.url) || [],
          likes: likesMap.get(photo.url) || 0,
        }))

        return NextResponse.json({ photos: photosWithData })
      } catch (err) {
        lastError = err
        retries--
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.error("[v0] Error listing photos after retries:", lastError?.message)
    return NextResponse.json({ photos: [] })
  } catch (error) {
    console.error("[v0] Error listing photos:", error)
    return NextResponse.json({ photos: [] })
  }
}
