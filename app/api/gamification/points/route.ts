import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple" // In a real app, this would be from auth

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("love_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error fetching love points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // If no data exists, return default values
    if (!data) {
      return NextResponse.json({
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
      })
    }
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error in GET /api/gamification/points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { activity_type, points, description } = body
    
    if (!activity_type || !points) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Get current points
    let { data: currentPoints } = await supabase
      .from("love_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .single()
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    let newStreak = 1
    let longestStreak = 0
    
    if (currentPoints) {
      // Check if last activity was yesterday (maintain streak)
      const lastActivity = new Date(currentPoints.last_activity_date)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (currentPoints.last_activity_date === today) {
        // Already logged today, don't increase streak
        newStreak = currentPoints.current_streak
        longestStreak = currentPoints.longest_streak
      } else if (lastActivity.toDateString() === yesterday.toDateString()) {
        // Last activity was yesterday, continue streak
        newStreak = currentPoints.current_streak + 1
        longestStreak = Math.max(newStreak, currentPoints.longest_streak)
      } else if (lastActivity.toDateString() === new Date(today).toDateString()) {
        // Already logged today
        newStreak = currentPoints.current_streak
        longestStreak = currentPoints.longest_streak
      }
      // else: streak broken, reset to 1
    }
    
    // Update or insert love points
    const { data, error } = await supabase
      .from("love_points")
      .upsert({
        couple_id: COUPLE_ID,
        total_points: (currentPoints?.total_points || 0) + points,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error updating love points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Log activity
    await supabase.from("activity_log").insert({
      couple_id: COUPLE_ID,
      activity_type,
      points_awarded: points,
      description,
    })
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error in POST /api/gamification/points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
