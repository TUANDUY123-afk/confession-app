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
        coins: 0,
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
    let { data: currentPoints, error: fetchError } = await supabase
      .from("love_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .maybeSingle()
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    let newStreak = 1
    let longestStreak = 0
    
    if (currentPoints) {
      const points = currentPoints as any
      // Check if last activity was yesterday (maintain streak)
      const lastActivity = new Date(points.last_activity_date)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      if (points.last_activity_date === today) {
        // Already logged today, don't increase streak
        newStreak = points.current_streak
        longestStreak = points.longest_streak
      } else if (lastActivity.toDateString() === yesterday.toDateString()) {
        // Last activity was yesterday, continue streak
        newStreak = points.current_streak + 1
        longestStreak = Math.max(newStreak, points.longest_streak)
      } else if (lastActivity.toDateString() === new Date(today).toDateString()) {
        // Already logged today
        newStreak = points.current_streak
        longestStreak = points.longest_streak
      }
      // else: streak broken, reset to 1
    }
    
    // Update or insert love points
    let data, error
    
    if (currentPoints) {
      // Update existing record
      const result = await supabase
        .from("love_points")
        .update({
          total_points: (currentPoints as any).total_points + points,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("couple_id", COUPLE_ID)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const result = await supabase
        .from("love_points")
        .insert({
          couple_id: COUPLE_ID,
          total_points: points,
          current_streak: newStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString(),
        } as any)
        .select()
        .single()
      data = result.data
      error = result.error
    }
    
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
    } as any)
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error in POST /api/gamification/points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
