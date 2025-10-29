import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, content, mood, title, currentUserName } = body

    if (!id || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Verify user owns this entry
    const { data: entry } = await supabase
      .from("diary_entries")
      .select("author, user_name")
      .eq("id", id)
      .single()

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 })
    }

    const entryAuthor = entry.user_name || entry.author
    if (entryAuthor !== currentUserName) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update entry
    const { data: updatedEntry, error } = await supabase
      .from("diary_entries")
      .update({
        content,
        mood: mood || null,
        title: title || entry.title,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("[Update] Error:", error)
      throw error
    }

    return NextResponse.json({ success: true, entry: updatedEntry })
  } catch (error) {
    console.error("[v0] Error updating diary entry:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to update diary entry" }, { status: 500 })
  }
}
