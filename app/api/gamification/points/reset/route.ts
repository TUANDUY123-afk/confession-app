import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

export async function POST() {
  try {
    const supabase = getSupabaseClient()

    // Reset points to 0
    const { data, error } = await supabase
      .from("love_points")
      .update({
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("couple_id", COUPLE_ID)
      .select()
      .single()

    if (error) {
      console.error("Error resetting points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Points reset successfully",
      data 
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/points/reset:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
