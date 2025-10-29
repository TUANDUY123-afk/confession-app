import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"
import { addPoints, updateAchievement } from "@/lib/gamification-helpers"

interface Comment {
  id: string
  text: string
  author: string
  created_at: string
}

async function getComments(photoUrl: string) {
  try {
    const supabase = getSupabaseClient()
    const { data: comments, error } = await supabase
      .from("comments")
      .select("id, text, author, created_at")
      .eq("photo_url", photoUrl)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error getting comments:", error)
      return []
    }

    return comments || []
  } catch (error) {
    console.error("[v0] Error getting comments:", error)
    return []
  }
}

async function saveComment(photoUrl: string, comment: Comment) {
  try {
    const supabase = getSupabaseClient()
    await supabase.from("comments").insert({
      photo_url: photoUrl,
      text: comment.text,
      author: comment.author,
      created_at: comment.created_at,
    })
  } catch (error) {
    console.error("[v0] Error saving comment:", error)
    throw error
  }
}

async function deleteComment(commentId: string) {
  try {
    const supabase = getSupabaseClient()
    await supabase.from("comments").delete().eq("id", commentId)
  } catch (error) {
    console.error("[v0] Error deleting comment:", error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const photoUrl = request.nextUrl.searchParams.get("photoUrl")
    if (!photoUrl) {
      return NextResponse.json({ error: "No photoUrl provided" }, { status: 400 })
    }

    const comments = await getComments(photoUrl)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("[v0] Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, text, author } = await request.json()

    if (!photoUrl || !text || !author) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newComment: Comment = {
      id: Date.now().toString(),
      text,
      author,
      created_at: new Date().toISOString(),
    }

    await saveComment(photoUrl, newComment)

    // Award water points and update achievement for photo comments
    try {
      await addPoints({
        activity_type: 'comment_photo',
        points: 5,
        description: 'Comment ảnh +5 nước 💧'
      })
      
      // Update comment_king achievement (photo comments also count)
      try {
        console.log('[Comment Photo API] Updating comment_king achievement')
        await updateAchievement({
          achievement_type: 'comment_king',
          progress_increment: 0, // Will count from database
        })
      } catch (err) {
        console.error('[Comment Photo API] Error updating comment_king achievement:', err)
      }
    } catch (err) {
      console.error('Error awarding water for photo comment:', err)
    }

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    console.error("[v0] Error adding comment:", error)
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { commentId } = await request.json()

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 })
    }

    await deleteComment(commentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting comment:", error)
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
  }
}
