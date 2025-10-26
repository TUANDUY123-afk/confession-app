import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const events = []

    // Get milestones from love_story
    const { data: loveStory } = await supabase
      .from("love_story")
      .select("data")
      .limit(1)
      .maybeSingle()

    if (loveStory?.data?.milestones) {
      const milestones = loveStory.data.milestones.map((m: any) => ({
        id: m.id || Date.now().toString(),
        title: m.label || "Milestone",
        date: m.date || m.targetDate,
        type: "milestone" as const,
      }))
      events.push(...milestones)
    }

    // Get diary entries with dates
    const { data: diaryEntries } = await supabase
      .from("diary_entries")
      .select("id, title, content, date")
      .not("id", "like", "comment-%")
      .limit(100)

    if (diaryEntries) {
      const diaryEvents = diaryEntries.map((entry: any) => ({
        id: entry.id,
        title: entry.title || "Nhật ký",
        date: entry.date,
        type: "memory" as const,
      }))
      events.push(...diaryEvents)
    }

    return NextResponse.json({ data: events })
  } catch (err) {
    console.error("Error loading calendar events:", err)
    return NextResponse.json({ data: [] })
  }
}

