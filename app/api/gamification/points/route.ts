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
        water: 0,
        current_streak: 0,
        longest_streak: 0,
        last_activity_date: null,
        coins: 0,
        owned_flowers: [],
        claimed_stages: [],
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
    const { activity_type, points, description, coins, claimed_stage, owned_flower } = body
    
    console.log("POST /api/gamification/points - Request body:", {
      activity_type,
      points,
      description,
      coins,
      claimed_stage,
      owned_flower
    })
    
    if (activity_type === undefined) {
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
    
    // Handle arrays
    let ownedFlowers = (currentPoints as any)?.owned_flowers || []
    let claimedStages = (currentPoints as any)?.claimed_stages || []
    
    // Add claimed stage
    if (claimed_stage !== undefined && !claimedStages.includes(claimed_stage)) {
      claimedStages.push(claimed_stage)
    }
    
    // Add owned flower
    if (owned_flower !== undefined && !ownedFlowers.includes(owned_flower)) {
      ownedFlowers.push(owned_flower)
      // Reset points for the new flower to 0 (start fresh)
      // This will be done after the main update
    }
    
    // Update or insert love points
    let data, error
    
    if (currentPoints) {
      // Update existing record
      const updateData: any = {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
        owned_flowers: ownedFlowers,
        claimed_stages: claimedStages,
      }
      
      // Update water if provided
      if (points !== undefined) {
        updateData.water = ((currentPoints as any).water || 0) + points
      } else {
        updateData.water = (currentPoints as any).water || 0
      }
      
      // Update coins if provided
      if (coins !== undefined) {
        updateData.coins = ((currentPoints as any).coins || 0) + coins
        console.log("Updating coins:", {
          oldCoins: (currentPoints as any).coins || 0,
          coinsToAdd: coins,
          newCoins: updateData.coins
        })
      } else {
        updateData.coins = (currentPoints as any).coins || 0
      }
      
      console.log("Update data:", updateData)
      
      const result = await supabase
        .from("love_points")
        // @ts-ignore - Supabase type inference issue
        .update(updateData)
        .eq("couple_id", COUPLE_ID)
        .select()
        .single()
      data = result.data
      error = result.error
    } else {
      // Insert new record
      const insertData: any = {
        couple_id: COUPLE_ID,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
        owned_flowers: ownedFlowers,
        claimed_stages: claimedStages,
      }
      
      if (points !== undefined) {
        insertData.water = points
      } else {
        insertData.water = 0
      }
      
      if (coins !== undefined) {
        insertData.coins = coins
      } else {
        insertData.coins = 0
      }
      
      const result = await supabase
        .from("love_points")
        // @ts-ignore - Supabase type inference issue
        .insert(insertData)
        .select()
        .single()
      data = result.data
      error = result.error
    }
    
    if (error) {
      console.error("Error updating love points:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log("Updated love points successfully:", data)
    
    // Log activity
    await supabase.from("activity_log").insert({
      couple_id: COUPLE_ID,
      activity_type,
      points_awarded: points,
      description,
    } as any)
    
    // Handle new flower purchase: reset points to 0
    if (owned_flower !== undefined) {
      const wasNewFlower = !((currentPoints as any)?.owned_flowers || []).includes(owned_flower)
      console.log("=== FLOWER PURCHASE DETECTED ===")
      console.log("Flower ID:", owned_flower)
      console.log("Is new flower?", wasNewFlower)
      console.log("Current owned_flowers:", (currentPoints as any)?.owned_flowers)
      
      if (wasNewFlower) {
        // This is a new flower purchase - ALWAYS reset to 0 points from purchase time
        const purchasedAt = new Date().toISOString()
        console.log("New flower purchased:", owned_flower, "- FORCING reset to 0 at", purchasedAt)
        const { data: existing } = await supabase
          .from("flower_points")
          .select("*")
          .eq("couple_id", COUPLE_ID)
          .eq("flower_id", owned_flower)
          .maybeSingle()
        
        console.log("Existing record:", existing)
        
        if (existing) {
          console.log("Updating existing record to 0 points")
          await supabase
            .from("flower_points")
            // @ts-ignore - Supabase type inference issue
            .update({
              points: 0,
              purchased_at: purchasedAt, // Set purchase timestamp
              last_updated: purchasedAt,
            })
            .eq("couple_id", COUPLE_ID)
            .eq("flower_id", owned_flower)
        } else {
          console.log("Inserting new record with 0 points")
          await supabase
            .from("flower_points")
            // @ts-ignore - Supabase type inference issue
            .insert({
              couple_id: COUPLE_ID,
              flower_id: owned_flower,
              points: 0,
              purchased_at: purchasedAt, // Set purchase timestamp
              last_updated: purchasedAt,
            })
        }
        
        console.log("=== FLOWER RESET COMPLETE ===")
      } else {
        console.log("Flower already owned, skipping reset")
      }
    }
    
    // NO AUTOMATIC POINT DISTRIBUTION
    // Points are now manually distributed to flowers, not automatically
    // When points are added to a flower, they are deducted from total_points
    
    return NextResponse.json(data)
  } catch (err) {
    console.error("Error in POST /api/gamification/points:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
