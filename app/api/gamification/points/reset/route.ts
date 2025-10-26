import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

export async function POST() {
  try {
    const supabase = getSupabaseClient()

          // Reset love_points table
      const { data, error } = await supabase
        .from("love_points")
        .update({
          water: 0,
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
          coins: 0,
          owned_flowers: [],
          claimed_stages: [],
          updated_at: new Date().toISOString(),
        } as any)
      .eq("couple_id", COUPLE_ID)
      .select()
      .single()

    if (error) {
      console.error("Error resetting love_points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Reset flower_points table (delete all records for this couple)
    const { error: flowerPointsError } = await supabase
      .from("flower_points")
      .delete()
      .eq("couple_id", COUPLE_ID)

    if (flowerPointsError) {
      console.error("Error resetting flower_points:", flowerPointsError)
      // Continue even if flower_points delete fails
    }

    return NextResponse.json({ 
      message: "All data reset successfully",
      data 
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/points/reset:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
