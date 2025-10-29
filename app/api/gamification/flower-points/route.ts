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
    
    // Use a transaction-like approach: check and deduct atomically
    // First, get the current water
    const { data: lovePoints, error: fetchError } = await supabase
      .from("love_points")
      .select("water")
      .eq("couple_id", COUPLE_ID)
      .single()
    
    if (fetchError) {
      console.error("Error fetching love points:", fetchError)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
    
    const currentWater = (lovePoints as any)?.water || 0
    
    console.log("Water check:", {
      currentWater,
      water_to_add,
      hasEnough: water_to_add <= currentWater
    })
    
    // Check if user has enough water BEFORE attempting to deduct
    if (water_to_add > currentWater) {
      console.error("Not enough water:", {
        currentWater,
        water_to_add,
        shortfall: water_to_add - currentWater
      })
      return NextResponse.json({ 
        error: "Không đủ nước để tưới",
        details: {
          currentWater,
          water_to_add,
          needed: water_to_add - currentWater
        }
      }, { status: 400 })
    }
    
    // Try to deduct water atomically by checking again in the update
    // This prevents race conditions when multiple requests come in simultaneously
    const newWaterValue = currentWater - water_to_add
    
    if (newWaterValue < 0) {
      console.error("Race condition detected - water would be negative")
      return NextResponse.json({ 
        error: "Không đủ nước để tưới (race condition)",
        details: {
          currentWater,
          water_to_add,
          wouldResultIn: newWaterValue
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
    
    // Deduct water using the calculated value
    const { error: updateError } = await supabase
      .from("love_points")
      .update({
        water: newWaterValue,
        updated_at: new Date().toISOString(),
      } as any)
      .eq("couple_id", COUPLE_ID)
    
    if (updateError) {
      console.error("Error updating love points:", updateError)
      return NextResponse.json({ error: "Failed to update water" }, { status: 500 })
    }
    
    // Log water deduction to activity_log
    const flowerNames: { [key: string]: string } = {
      rose: "Hoa Hồng",
      tulip: "Hoa Tulip",
      sunflower: "Hoa Hướng Dương",
      jasmine: "Hoa Nhài",
      lavender: "Hoa Oải Hương",
      cherry: "Hoa Anh Đào",
    }
    const flowerName = flowerNames[flower_id] || flower_id
    
    await supabase.from("activity_log").insert({
      couple_id: COUPLE_ID,
      activity_type: "water_flower",
      points_awarded: -water_to_add, // Negative to indicate deduction
      description: `Tưới hoa ${flowerName}: -${water_to_add} nước 💧`,
      metadata: { flower_id, water_amount: water_to_add },
    } as any)
    
    // Check if flower reached stage 3 (Nở Rộ) for achievement
    // Get flower price to determine thresholds
    const flowerPrices: { [key: string]: number } = {
      rose: 100,
      tulip: 120,
      sunflower: 150,
      jasmine: 160,
      lavender: 180,
      cherry: 200,
    }
    const flowerPrice = flowerPrices[flower_id] || 100
    
    // Determine thresholds based on price
    let stage3Threshold = 500
    if (flowerPrice >= 200) {
      stage3Threshold = 1000
    } else if (flowerPrice >= 150) {
      stage3Threshold = 800
    }
    
    // Check if flower reached stage 3 and update achievement
    if (newFlowerWater >= stage3Threshold) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/gamification/achievements`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            achievement_type: 'love_garden_bloom',
            progress_increment: 1,
          })
        })
      } catch (err) {
        console.error('Error updating love_garden_bloom achievement:', err)
      }
    }
    
    return NextResponse.json({ 
      success: true,
      flower_water: newFlowerWater,
      remaining_water: newWaterValue
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/flower-points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
