import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

// GET: Fetch points for all flowers or a specific flower
export async function GET(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const { searchParams } = new URL(request.url)
    const flowerId = searchParams.get('flowerId')
    
    let query = supabase
      .from("flower_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
    
    if (flowerId) {
      query = query.eq("flower_id", flowerId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error("Error fetching flower points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [])
  } catch (err) {
    console.error("Error in GET /api/gamification/flower-points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST: Add points to a flower manually and deduct from total_points
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { flower_id, points_to_add } = body
    
    if (!flower_id || points_to_add === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if user has enough total points
    const { data: lovePoints } = await supabase
      .from("love_points")
      .select("total_points")
      .eq("couple_id", COUPLE_ID)
      .single()
    
    const currentTotalPoints = (lovePoints as any)?.total_points || 0
    
    if (points_to_add > currentTotalPoints) {
      return NextResponse.json({ error: "Không đủ điểm để phân bổ" }, { status: 400 })
    }
    
    // Get current flower points
    const { data: existingFlower } = await supabase
      .from("flower_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("flower_id", flower_id)
      .maybeSingle()
    
    const currentFlowerPoints = (existingFlower as any)?.points || 0
    const newFlowerPoints = currentFlowerPoints + points_to_add
    
    // Update flower points
    if (existingFlower) {
      await supabase
        .from("flower_points")
        .update({
          points: newFlowerPoints,
          last_updated: new Date().toISOString(),
        } as any)
        .eq("couple_id", COUPLE_ID)
        .eq("flower_id", flower_id)
    } else {
      await supabase
        .from("flower_points")
        .insert({
          couple_id: COUPLE_ID,
          flower_id: flower_id,
          points: newFlowerPoints,
          last_updated: new Date().toISOString(),
        } as any)
    }
    
    // Deduct points from total
    await supabase
      .from("love_points")
      .update({
        total_points: currentTotalPoints - points_to_add,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("couple_id", COUPLE_ID)
    
    return NextResponse.json({ 
      success: true,
      flower_points: newFlowerPoints,
      total_points: currentTotalPoints - points_to_add
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/flower-points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
