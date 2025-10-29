import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"
import { ACHIEVEMENTS } from "../route"

const COUPLE_ID = "default_couple"

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { achievement_type } = body
    
    if (!achievement_type) {
      return NextResponse.json({ error: "Missing achievement_type" }, { status: 400 })
    }
    
    // Find achievement definition
    const achievementDef = ACHIEVEMENTS.find(a => a.type === achievement_type)
    if (!achievementDef) {
      return NextResponse.json({ error: "Invalid achievement_type" }, { status: 400 })
    }
    
    // Get current achievement progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from("achievements")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("achievement_type", achievement_type)
      .maybeSingle()
    
    if (fetchError) {
      console.error("[Claim Achievement] Error fetching:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }
    
    if (!currentProgress) {
      return NextResponse.json({ error: "Achievement not found" }, { status: 404 })
    }
    
    // Get unlocked and claimed levels from metadata
    const metadata = (currentProgress.metadata as any) || {}
    const unlockedLevels: number[] = Array.isArray(metadata.unlocked_levels) 
      ? metadata.unlocked_levels 
      : []
    const claimedLevels: number[] = Array.isArray(metadata.claimed_levels) 
      ? metadata.claimed_levels 
      : []
    
    // Find levels that are unlocked but not claimed
    const unclaimedLevels = unlockedLevels.filter(levelIndex => !claimedLevels.includes(levelIndex))
    
    if (unclaimedLevels.length === 0) {
      return NextResponse.json({ 
        error: "No rewards available to claim",
        claimedLevels 
      }, { status: 400 })
    }
    
    // Calculate total reward
    const totalReward = unclaimedLevels.reduce((sum, levelIndex) => {
      return sum + (achievementDef.levels[levelIndex]?.reward || 0)
    }, 0)
    
    // Add reward to water
    const { data: currentPoints, error: waterFetchError } = await supabase
      .from("love_points")
      .select("water")
      .eq("couple_id", COUPLE_ID)
      .maybeSingle()
    
    if (waterFetchError) {
      console.error("[Claim Achievement] Error fetching water:", waterFetchError)
      return NextResponse.json({ error: waterFetchError.message }, { status: 500 })
    }
    
    const currentWater = (currentPoints as any)?.water || 0
    const newWater = currentWater + totalReward
    
    // Update water
    const { error: waterUpdateError } = await supabase
      .from("love_points")
      .update({ water: newWater })
      .eq("couple_id", COUPLE_ID)
    
    if (waterUpdateError) {
      console.error("[Claim Achievement] Error updating water:", waterUpdateError)
      return NextResponse.json({ error: waterUpdateError.message }, { status: 500 })
    }
    
    // Update claimed levels in metadata
    const newClaimedLevels = [...claimedLevels, ...unclaimedLevels]
    
    const { error: updateError } = await supabase
      .from("achievements")
      .update({
        metadata: {
          unlocked_levels: unlockedLevels,
          claimed_levels: newClaimedLevels,
        },
        updated_at: new Date().toISOString(),
      } as any)
      .eq("couple_id", COUPLE_ID)
      .eq("achievement_type", achievement_type)
    
    if (updateError) {
      console.error("[Claim Achievement] Error updating achievement:", updateError)
      // Water was already added, so don't fail completely
      return NextResponse.json({ 
        error: updateError.message,
        warning: "Reward was awarded but achievement update failed",
        totalReward,
        newWater,
      }, { status: 500 })
    }
    
    // Log the reward
    try {
      await supabase.from("activity_log").insert({
        couple_id: COUPLE_ID,
        activity_type: "achievement_reward",
        points_awarded: totalReward,
        description: `🏆 Thành tích: ${achievementDef.name} - Nhận thưởng ${unclaimedLevels.length} giai đoạn (+${totalReward} nước 💧)`,
        metadata: { 
          achievement_type, 
          claimed_levels: unclaimedLevels,
          reward_source: "achievement_claim"
        },
      } as any)
    } catch (logError) {
      console.error("[Claim Achievement] Error logging reward:", logError)
      // Don't fail - reward was already given
    }
    
    console.log(`[Claim Achievement] ✅ Claimed ${totalReward} nước for ${unclaimedLevels.length} levels`)
    
    return NextResponse.json({ 
      success: true,
      totalReward,
      claimedLevels: unclaimedLevels,
      newWater,
      previousWater: currentWater,
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/achievements/claim:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

