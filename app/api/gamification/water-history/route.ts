import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

// GET: Fetch water points history (both additions and subtractions)
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Fetch all activity logs related to water points (where points_awarded is not 0)
    // This captures both additions (positive) and subtractions (negative)
    const { data, error } = await supabase
      .from("activity_log")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .neq("points_awarded", 0) // Only get records where water changed
      .order("created_at", { ascending: false })
      .limit(limit)
    
    if (error) {
      console.error("Error fetching water history:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Transform data to include formatted date and type
    const history = (data || []).map((item: any) => ({
      id: item.id,
      type: item.points_awarded > 0 ? "add" : "subtract",
      amount: Math.abs(item.points_awarded),
      description: item.description || item.activity_type,
      activity_type: item.activity_type,
      metadata: item.metadata,
      created_at: item.created_at,
      formatted_date: new Date(item.created_at).toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }))
    
    return NextResponse.json(history)
  } catch (err) {
    console.error("Error in GET /api/gamification/water-history:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

