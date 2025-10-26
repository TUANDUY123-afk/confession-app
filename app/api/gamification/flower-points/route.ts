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

// POST: Add points to a flower (creates record if doesn't exist)
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { flower_id, points, total_points } = body
    
    if (!flower_id || points === undefined || total_points === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if record exists
    const { data: existing } = await supabase
      .from("flower_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("flower_id", flower_id)
      .maybeSingle()
    
    let result
    if (existing) {
      // Update existing record
      result = await supabase
        .from("flower_points")
        .update({
          points: total_points,
          last_updated: new Date().toISOString(),
        })
        .eq("couple_id", COUPLE_ID)
        .eq("flower_id", flower_id)
        .select()
        .single()
    } else {
      // Insert new record
      result = await supabase
        .from("flower_points")
        .insert({
          couple_id: COUPLE_ID,
          flower_id: flower_id,
          points: total_points,
          last_updated: new Date().toISOString(),
        })
        .select()
        .single()
    }
    
    if (result.error) {
      console.error("Error updating flower points:", result.error)
      return NextResponse.json({ error: result.error.message }, { status: 500 })
    }
    
    return NextResponse.json(result.data)
  } catch (err) {
    console.error("Error in POST /api/gamification/flower-points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
