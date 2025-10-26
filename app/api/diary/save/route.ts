import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const entries = await request.json()

    const supabase = getSupabaseClient()

    for (const entry of entries) {
      await supabase.from("diary_entries").upsert(
        {
          id: entry.id,
          author: entry.author || "Anonymous",
          title: entry.title || "",
          content: entry.content,
          date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
          mood: entry.mood || null,
        },
        { onConflict: "id" },
      )
    }

    console.log("[v0] Diary entries saved successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving diary entries:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to save diary entries" }, { status: 500 })
  }
}
