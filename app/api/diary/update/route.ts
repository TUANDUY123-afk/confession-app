import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const entry = await request.json()

    const supabase = getSupabaseClient()

    await supabase
      .from("diary_entries")
      .update({
        author: entry.author || "Anonymous",
        title: entry.title || "",
        content: entry.content,
        mood: entry.mood || null,
      })
      .eq("id", entry.id)

    console.log("[v0] Diary entry updated successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating diary entry:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to update diary entry" }, { status: 500 })
  }
}
