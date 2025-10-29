import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"
import { addPoints, updateAchievement } from "@/lib/gamification-helpers"

// 🧠 GET: lấy danh sách comment của 1 entry
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const entryId = url.searchParams.get("entryId")
    if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 })

    const supabase = getSupabaseClient()
    
    // Get comments where the id contains the entryId (since we generate comment IDs based on entryId)
    const { data, error } = await supabase
      .from("diary_entries")
      .select("*")
      .like("id", `comment-${entryId}-%`)
      .order("created_at", { ascending: true })

    if (error) throw error
    
    // Format comments for frontend
    const formattedComments = (data || []).map(entry => ({
      id: entry.id,
      content: entry.content,
      author: entry.author,
      created_at: entry.created_at
    }))
    
    return NextResponse.json({ comments: formattedComments })
  } catch (err) {
    console.error("[GET /diary-comments] Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 🧠 POST: thêm comment mới
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { entryId, author, text, title } = body

    if (!entryId || !text) {
      return NextResponse.json({ error: "Missing entryId or text" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    
    // Generate unique ID for comment
    const commentId = `comment-${entryId}-${Date.now()}`
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from("diary_entries")
      .insert([
        {
          id: commentId,
          author: author || "Ẩn danh",
          content: text,
          title: `Comment on ${entryId}`,
          date: now,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("Insert comment error:", error)
      throw error
    }
    
    // Award water points for commenting
    try {
      // Use direct function call instead of HTTP fetch (works on Vercel)
      await addPoints({
        activity_type: 'comment_diary',
        points: 5,
        description: 'Comment nhật ký +5 nước 💧'
      })
      
      // Update comment_king achievement
      try {
        await updateAchievement({
          achievement_type: 'comment_king',
          progress_increment: 1,
        })
      } catch (err) {
        console.error('Error updating comment_king achievement:', err)
      }
    } catch (err) {
      console.error('Error awarding water for comment:', err)
    }
    
    // Return in format expected by frontend
    const commentData = {
      id: data.id,
      content: data.content,
      author: data.author,
      created_at: data.created_at || now
    }
    
    console.log("Returning comment:", commentData)
    
    return NextResponse.json({ 
      success: true, 
      comment: commentData
    })
  } catch (err) {
    console.error("[POST /diary-comments] Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// 🧠 DELETE: xóa comment
export async function DELETE(req: Request) {
  try {
    const body = await req.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    const { error } = await supabase.from("diary_entries").delete().eq("id", commentId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[DELETE /diary-comments] Error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
