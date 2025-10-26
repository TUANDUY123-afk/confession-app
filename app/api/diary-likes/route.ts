import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const entryId = url.searchParams.get("entryId")
    if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 })

    const supabase = getSupabaseClient()
    const { data, error } = await supabase.from("diary_likes").select("user_name").eq("entry_id", entryId)

    if (error) throw error
    return NextResponse.json({
      count: data.length,
      likedByCurrentUser: false, // Bạn có thể cập nhật logic này sau
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { entryId, userName } = await req.json()
    const supabase = getSupabaseClient()

    // kiểm tra nếu user đã like
    const { data: existing } = await supabase
      .from("diary_likes")
      .select("*")
      .eq("entry_id", entryId)
      .eq("user_name", userName)
      .single()

    if (existing) {
      await supabase.from("diary_likes").delete().eq("id", existing.id)
      return NextResponse.json({ liked: false })
    } else {
      await supabase.from("diary_likes").insert([{ entry_id: entryId, user_name: userName }])
      return NextResponse.json({ liked: true })
    }
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 })
  }
}
