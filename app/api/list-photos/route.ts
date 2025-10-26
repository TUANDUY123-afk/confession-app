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

        // Load comments for each photo
        const photosWithData = await Promise.all(
          (photos || []).map(async (photo) => {
            const { data: comments } = await supabase
              .from("comments")
              .select("id, text, author, created_at")
              .eq("photo_url", photo.url)
              .order("created_at", { ascending: false })

            // Load like count
            const { data: likeData } = await supabase
              .from("likes")
              .select("like_count")
              .eq("photo_url", photo.url)
              .single()

            return {
              ...photo,
              comments: comments || [],
              likes: likeData?.like_count || 0,
            }
          })
        )

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
