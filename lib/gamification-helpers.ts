import { getSupabaseClient } from "@/lib/supabase-client"

const COUPLE_ID = "default_couple"

// Helper function to add points directly (for server-side calls)
export async function addPoints(data: {
  activity_type: string
  points?: number
  description?: string
  coins?: number
  claimed_stage?: string
  owned_flower?: string
}) {
  try {
    const supabase = getSupabaseClient()
    
    // Get current points
    let { data: currentPoints } = await supabase
      .from("love_points")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .maybeSingle()
    
    // Calculate streak
    const today = new Date().toISOString().split('T')[0]
    let newStreak = 1
    let longestStreak = 0
    let streakIncreased = false
    let isFirstActivityToday = false
    
    if (currentPoints) {
      const points = currentPoints as any
      
      if (points.last_activity_date === today) {
        newStreak = points.current_streak
        longestStreak = points.longest_streak
        streakIncreased = false
        isFirstActivityToday = false
      } else {
        isFirstActivityToday = true
        const lastActivity = new Date(points.last_activity_date)
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(0, 0, 0, 0)
        
        if (lastActivity.toDateString() === yesterday.toDateString()) {
          newStreak = points.current_streak + 1
          longestStreak = Math.max(newStreak, points.longest_streak)
          streakIncreased = true
        } else {
          newStreak = 1
          longestStreak = Math.max(1, points.longest_streak)
          streakIncreased = true
        }
      }
    } else {
      isFirstActivityToday = true
      streakIncreased = true
    }
    
    const streakWaterBonus = (isFirstActivityToday && streakIncreased) ? newStreak * 10 : 0
    
    // Handle arrays
    let ownedFlowers = (currentPoints as any)?.owned_flowers || []
    let claimedStages = (currentPoints as any)?.claimed_stages || []
    
    if (data.claimed_stage !== undefined && !claimedStages.includes(data.claimed_stage)) {
      claimedStages.push(data.claimed_stage)
    }
    
    if (data.owned_flower !== undefined && !ownedFlowers.includes(data.owned_flower)) {
      ownedFlowers.push(data.owned_flower)
    }
    
    // Update or insert
    if (currentPoints) {
      const currentWater = (currentPoints as any).water || 0
      let totalWaterToAdd = 0
      
      if (data.points !== undefined) {
        totalWaterToAdd += data.points
      }
      
      if (streakWaterBonus > 0) {
        totalWaterToAdd += streakWaterBonus
      }
      
      const updateData: any = {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
        owned_flowers: ownedFlowers,
        claimed_stages: claimedStages,
        water: currentWater + totalWaterToAdd,
      }
      
      if (data.coins !== undefined) {
        updateData.coins = ((currentPoints as any).coins || 0) + data.coins
      } else {
        updateData.coins = (currentPoints as any).coins || 0
      }
      
      await supabase
        .from("love_points")
        .update(updateData)
        .eq("couple_id", COUPLE_ID)
    } else {
      let totalWater = 0
      if (data.points !== undefined) {
        totalWater += data.points
      }
      if (streakWaterBonus > 0) {
        totalWater += streakWaterBonus
      }
      
      const insertData: any = {
        couple_id: COUPLE_ID,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
        owned_flowers: ownedFlowers,
        claimed_stages: claimedStages,
        water: totalWater,
        coins: data.coins !== undefined ? data.coins : 0,
      }
      
      await supabase.from("love_points").insert(insertData)
    }
    
    // Log activity
    await supabase.from("activity_log").insert({
      couple_id: COUPLE_ID,
      activity_type: data.activity_type,
      points_awarded: data.points || 0,
      description: data.description,
    } as any)
    
    if (streakWaterBonus > 0) {
      await supabase.from("activity_log").insert({
        couple_id: COUPLE_ID,
        activity_type: 'streak_bonus',
        points_awarded: streakWaterBonus,
        description: `🔥 Streak ${newStreak} ngày: +${streakWaterBonus} nước`,
      } as any)
    }
    
    return { success: true, streak: newStreak, streakBonus: streakWaterBonus }
  } catch (err) {
    console.error("Error in addPoints helper:", err)
    throw err
  }
}

// Helper function to update achievement directly
export async function updateAchievement(data: {
  achievement_type: string
  progress_increment?: number
}) {
  try {
    const supabase = getSupabaseClient()
    
    console.log(`[updateAchievement] Updating achievement: ${data.achievement_type}, increment: ${data.progress_increment}`)
    
    // Import achievements definitions - need to use dynamic import for route files
    const achievementsModule = await import("@/app/api/gamification/achievements/route")
    const ACHIEVEMENTS = achievementsModule.ACHIEVEMENTS
    
    const achievementDef = ACHIEVEMENTS.find(a => a.type === data.achievement_type)
    if (!achievementDef) {
      throw new Error(`Invalid achievement type: ${data.achievement_type}`)
    }
    
    // Get current progress
    const { data: currentProgress, error: fetchError } = await supabase
      .from("achievements")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("achievement_type", data.achievement_type)
      .maybeSingle()
    
    if (fetchError) {
      console.error(`[updateAchievement] Error fetching current progress:`, fetchError)
    }
    
    const unlockedLevels = (currentProgress?.metadata as any)?.unlocked_levels || []
    const currentProgressValue = currentProgress?.progress || 0
    
    console.log(`[updateAchievement] Current progress: ${currentProgressValue}, Unlocked levels:`, unlockedLevels)
    
    // Special handling for daily_diary and love_garden_bloom
    let newProgress = currentProgressValue
    
    if (data.achievement_type === "daily_diary") {
      const { data: pointsData } = await supabase
        .from("love_points")
        .select("current_streak")
        .eq("couple_id", COUPLE_ID)
        .maybeSingle()
      
      const currentStreak = pointsData?.current_streak || 0
      newProgress = currentStreak
      console.log(`[updateAchievement] daily_diary - Using streak: ${currentStreak}`)
    } else if (data.achievement_type === "love_garden_bloom") {
      const { data: allFlowers } = await supabase
        .from("flower_points")
        .select("flower_id, points")
        .eq("couple_id", COUPLE_ID)
      
      const flowerPrices: { [key: string]: number } = {
        rose: 100,
        tulip: 120,
        sunflower: 150,
        jasmine: 160,
        lavender: 180,
        cherry: 200,
      }
      
      let flowersAtStage3 = 0
      if (allFlowers) {
        for (const flower of allFlowers) {
          const price = flowerPrices[flower.flower_id] || 100
          let stage3Threshold = 500
          if (price >= 200) {
            stage3Threshold = 1000
          } else if (price >= 150) {
            stage3Threshold = 800
          }
          
          if (flower.points >= stage3Threshold) {
            flowersAtStage3++
          }
        }
      }
      
      newProgress = flowersAtStage3
      console.log(`[updateAchievement] love_garden_bloom - Flowers at stage 3: ${flowersAtStage3}`)
    } else {
      const increment = data.progress_increment || 1
      newProgress = currentProgressValue + increment
      console.log(`[updateAchievement] ${data.achievement_type} - Progress: ${currentProgressValue} + ${increment} = ${newProgress}`)
    }
    
    // Check which levels should be unlocked
    const newlyUnlockedLevels: number[] = []
    let totalReward = 0
    
    achievementDef.levels.forEach((level, index) => {
      if (!unlockedLevels.includes(index) && newProgress >= level.target) {
        newlyUnlockedLevels.push(index)
        totalReward += level.reward
      }
    })
    
    const allUnlockedLevels = [...unlockedLevels, ...newlyUnlockedLevels]
    const maxTarget = Math.max(...achievementDef.levels.map(l => l.target))
    const isFullyUnlocked = newProgress >= maxTarget
    
    console.log(`[updateAchievement] New progress: ${newProgress}, Newly unlocked:`, newlyUnlockedLevels, `Total reward: ${totalReward}`)
    
    // Update achievement progress - use insert with onConflict for composite unique key
    const upsertData = {
      couple_id: COUPLE_ID,
      achievement_type: data.achievement_type,
      progress: newProgress,
      target: maxTarget,
      unlocked: isFullyUnlocked,
      unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : (currentProgress?.unlocked_at || null),
      metadata: { unlocked_levels: allUnlockedLevels },
      updated_at: new Date().toISOString(),
    }
    
    // Try upsert - Supabase needs the unique constraint columns specified
    const { error: upsertError } = await supabase
      .from("achievements")
      .upsert(upsertData as any, {
        onConflict: "couple_id,achievement_type"
      })
    
    if (upsertError) {
      console.error(`[updateAchievement] Error upserting achievement:`, upsertError)
      // Fallback: try update first, then insert if not exists
      const { data: existing, error: checkError } = await supabase
        .from("achievements")
        .select("id")
        .eq("couple_id", COUPLE_ID)
        .eq("achievement_type", data.achievement_type)
        .maybeSingle()
      
      if (checkError) {
        console.error(`[updateAchievement] Error checking existing:`, checkError)
        throw upsertError
      }
      
      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from("achievements")
          .update({
            progress: newProgress,
            target: maxTarget,
            unlocked: isFullyUnlocked,
            unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : (currentProgress?.unlocked_at || null),
            metadata: { unlocked_levels: allUnlockedLevels },
            updated_at: new Date().toISOString(),
          } as any)
          .eq("couple_id", COUPLE_ID)
          .eq("achievement_type", data.achievement_type)
        
        if (updateError) {
          console.error(`[updateAchievement] Error updating existing:`, updateError)
          throw updateError
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("achievements")
          .insert(upsertData as any)
        
        if (insertError) {
          console.error(`[updateAchievement] Error inserting new:`, insertError)
          throw insertError
        }
      }
    }
    
    console.log(`[updateAchievement] Successfully updated achievement: ${data.achievement_type}`)
    
    // Award water for newly unlocked levels
    if (totalReward > 0) {
      // Get current water and add reward
      const { data: currentPoints } = await supabase
        .from("love_points")
        .select("water")
        .eq("couple_id", COUPLE_ID)
        .maybeSingle()
      
      const currentWater = (currentPoints as any)?.water || 0
      
      await supabase.from("love_points").update({
        water: currentWater + totalReward,
      }).eq("couple_id", COUPLE_ID)
      
      await supabase.from("activity_log").insert({
        couple_id: COUPLE_ID,
        activity_type: "achievement_unlock",
        points_awarded: totalReward,
        description: `Mở khóa ${newlyUnlockedLevels.length} giai đoạn thành tích: ${achievementDef.name}`,
        metadata: { achievement_type: data.achievement_type, unlocked_levels: newlyUnlockedLevels },
      } as any)
    }
    
    return {
      success: true,
      unlockedLevels: newlyUnlockedLevels,
      totalReward,
      progress: newProgress
    }
  } catch (err) {
    console.error("Error in updateAchievement helper:", err)
    throw err
  }
}

