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

// POST: Water a flower manually and deduct water
export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { flower_id, water_to_add } = body
    
    if (!flower_id || water_to_add === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Check if user has enough water
    const { data: lovePoints } = await supabase
      .from("love_points")
      .select("water")
      .eq("couple_id", COUPLE_ID)
      .single()
    
    const currentWater = (lovePoints as any)?.water || 0
    
    console.log("Water check:", {
      currentWater,
      water_to_add,
      hasEnough: water_to_add <= currentWater
    })
    
    if (water_to_add > currentWater) {
      return NextResponse.json({ 
        error: "Không đủ nước để tưới",
        details: {
          currentWater,
          water_to_add,
          needed: water_to_add
        }
      }, { status: 400 })
    }
    
    // Get current flower points
    const { data: existingFlower } = await supabase
      .from("flower_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("flower_id", flower_id)
      .maybeSingle()
    
    const currentFlowerWater = (existingFlower as any)?.points || 0
    const newFlowerWater = currentFlowerWater + water_to_add
    
    // Update flower water (stored in points column)
    if (existingFlower) {
      await supabase
        .from("flower_points")
        .update({
          points: newFlowerWater,
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
          points: newFlowerWater,
          last_updated: new Date().toISOString(),
        } as any)
    }
    
    // Deduct water
    await supabase
      .from("love_points")
      .update({
        water: currentWater - water_to_add,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("couple_id", COUPLE_ID)
    
    return NextResponse.json({ 
      success: true,
      flower_water: newFlowerWater,
      remaining_water: currentWater - water_to_add
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/flower-points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
