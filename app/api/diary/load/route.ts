import { getSupabaseClient } from "@/lib/supabase-client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const userName = request.nextUrl.searchParams.get("userName") || ""

    let retries = 3
    let lastError: any = null

    while (retries > 0) {
      try {
        // Load entries
        const { data: entries, error } = await supabase
          .from("diary_entries")
          .select("*")
          .not("id", "like", "comment-%") // Exclude comments
          .order("date", { ascending: false })

        if (error) {
          lastError = error
          retries--
          if (retries > 0) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 500))
            continue
          }
          throw error
        }

        // ✅ OPTIMIZATION: Load all likes and comments in 2 queries instead of N queries
        const entryIds = entries?.map(e => e.id) || []
        
        if (entryIds.length > 0) {
          // Get all likes for these entries
          const { data: likes, error: likesError } = await supabase
            .from("diary_likes")
            .select("entry_id, user_name")
            .in("entry_id", entryIds)
          
          // Get all comments for these entries
          const { data: comments, error: commentsError } = await supabase
            .from("diary_comments")
            .select("entry_id")
            .in("entry_id", entryIds)

          // Create lookup maps
          const likesMap = new Map<string, { count: number, likedByCurrentUser: boolean }>()
          
          if (likes && !likesError) {
            likes.forEach(like => {
              const existing = likesMap.get(like.entry_id) || { count: 0, likedByCurrentUser: false }
              existing.count++
              if (like.user_name === userName) {
                existing.likedByCurrentUser = true
              }
              likesMap.set(like.entry_id, existing)
            })
          }
          
          const commentsMap = new Map<string, number>()
          if (comments && !commentsError) {
            comments.forEach(comment => {
              commentsMap.set(comment.entry_id, (commentsMap.get(comment.entry_id) || 0) + 1)
            })
          }

          // Attach data to entries
          const enrichedEntries = entries?.map(entry => ({
            ...entry,
            likesCount: likesMap.get(entry.id)?.count || 0,
            hasLiked: likesMap.get(entry.id)?.likedByCurrentUser || false,
            commentsCount: commentsMap.get(entry.id) || 0
          }))

          return NextResponse.json(enrichedEntries || [])
        }

        return NextResponse.json(entries || [])
      } catch (err) {
        lastError = err
        retries--
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.error("[v0] Supabase error after retries:", lastError?.message)
    return NextResponse.json([])
  } catch (error) {
    console.error("[v0] Error loading diary entries:", error instanceof Error ? error.message : String(error))
    return NextResponse.json([])
  }
}
