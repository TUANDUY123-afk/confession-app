import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const entries = await request.json()

    const supabase = getSupabaseClient()

    for (const entry of entries) {
      // Check if entry already exists
      const { data: existing } = await supabase
        .from("diary_entries")
        .select("id")
        .eq("id", entry.id)
        .maybeSingle()
      
      const isNewEntry = !existing
      
      await supabase.from("diary_entries").upsert(
        {
          id: entry.id,
          author: entry.author || "Anonymous",
          title: entry.title || "",
          content: entry.content,
          date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
          mood: entry.mood || null,
        } as any,
        { onConflict: "id" },
      )
      
      // Award water points only for new entries (not comments)
      if (isNewEntry && !entry.id.startsWith('comment-')) {
        try {
          const pointsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gamification/points`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              activity_type: 'write_diary',
              points: 20,
              description: 'Viết nhật ký +20 nước 💧'
            })
          })
          
          if (pointsRes.ok) {
            const pointsData = await pointsRes.json()
            // Check if streak >= 3 for daily_diary achievement
            if (pointsData.current_streak >= 3) {
              try {
                await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gamification/achievements`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    achievement_type: 'daily_diary',
                    progress_increment: 0, // Don't increment, just check if streak >= 3
                  })
                })
              } catch (err) {
                console.error('Error updating daily_diary achievement:', err)
              }
            }
          }
        } catch (err) {
          console.error('Error awarding water for diary entry:', err)
        }
      }
    }

    console.log("[v0] Diary entries saved successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving diary entries:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Failed to save diary entries" }, { status: 500 })
  }
}
