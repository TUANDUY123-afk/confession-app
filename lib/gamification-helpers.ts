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
    
    // Get unlocked levels from metadata, ensuring it's an array
    let unlockedLevels: number[] = []
    if (currentProgress?.metadata) {
      const metadata = currentProgress.metadata as any
      if (Array.isArray(metadata.unlocked_levels)) {
        unlockedLevels = metadata.unlocked_levels
      } else if (metadata.unlocked_levels) {
        unlockedLevels = [metadata.unlocked_levels]
      }
    }
    
    const currentProgressValue = currentProgress?.progress || 0
    
    console.log(`[updateAchievement] Current progress: ${currentProgressValue}, Unlocked levels:`, unlockedLevels)
    
    // Special handling for different achievement types - use source of truth from database
    let newProgress = currentProgressValue
    
    if (data.achievement_type === "daily_diary") {
      // Get current streak from love_points (tracked dynamically)
      const { data: pointsData } = await supabase
        .from("love_points")
        .select("current_streak")
        .eq("couple_id", COUPLE_ID)
        .maybeSingle()
      
      const currentStreak = pointsData?.current_streak || 0
      newProgress = currentStreak
      console.log(`[updateAchievement] daily_diary - Using streak: ${currentStreak}`)
      
    } else if (data.achievement_type === "love_garden_bloom") {
      // Count flowers at stage 3 (Nở Rộ) from database
      const { data: allFlowers } = await supabase
        .from("flower_points")
        .select("flower_id, points")
        .eq("couple_id", COUPLE_ID)
      
      const flowerPrices: { [key: string]: number } = {
        rose: 150,
        tulip: 180,
        sunflower: 220,
        jasmine: 240,
        lavender: 270,
        cherry: 300,
        orchid: 350,
        lotus: 400,
        peony: 500,
        "rose-gold": 600,
        "eternal-rose": 800,
      }
      
      let flowersAtStage3 = 0
      if (allFlowers) {
        for (const flower of allFlowers) {
          const price = flowerPrices[flower.flower_id] || 150
          let stage3Threshold = 1200
          if (price >= 600) {
            stage3Threshold = 2500
          } else if (price >= 400) {
            stage3Threshold = 2200
          } else if (price >= 300) {
            stage3Threshold = 2000
          } else if (price >= 200) {
            stage3Threshold = 1500
          } else {
            stage3Threshold = 1200
          }
          
          if (flower.points >= stage3Threshold) {
            flowersAtStage3++
          }
        }
      }
      
      newProgress = flowersAtStage3
      console.log(`[updateAchievement] love_garden_bloom - Flowers at stage 3: ${flowersAtStage3}`)
      
    } else if (data.achievement_type === "photo_collector") {
      // Count actual photos from database (source of truth)
      const { count, error: countError } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
      
      if (countError) {
        console.error(`[updateAchievement] Error counting photos:`, countError)
        // Fallback to increment if count fails
        const increment = data.progress_increment || 1
        newProgress = currentProgressValue + increment
      } else {
        newProgress = count || 0
        console.log(`[updateAchievement] photo_collector - Found ${count} photos in database`)
      }
      
    } else if (data.achievement_type === "like_master") {
      // Count total likes from both diary_likes and photo likes (source of truth)
      // Get diary likes count (each record = 1 like)
      const { count: diaryLikesCount, error: diaryError } = await supabase
        .from("diary_likes")
        .select("*", { count: "exact", head: true })
      
      // Get photo likes count (sum of like_count from likes table, excluding diary entries)
      const { data: photoLikesData, error: photoError } = await supabase
        .from("likes")
        .select("photo_url, like_count")
      
      let photoLikesCount = 0
      if (!photoError && photoLikesData) {
        // Filter out diary entries (they have "diary:" prefix) and sum like_count
        const photoLikes = photoLikesData.filter(like => {
          const photoUrl = like.photo_url || ""
          return !photoUrl.startsWith("diary:")
        })
        photoLikesCount = photoLikes.reduce((sum, like) => {
          const count = like.like_count || 0
          return sum + count
        }, 0)
        console.log(`[updateAchievement] like_master: Filtered ${photoLikes.length} photo entries, total likes: ${photoLikesCount}`)
      } else if (photoError) {
        console.error(`[updateAchievement] Error fetching photo likes:`, photoError)
      }
      
      if (diaryError) {
        console.error(`[updateAchievement] Error counting diary likes:`, diaryError)
        // Fallback to increment if count fails
        const increment = data.progress_increment || 1
        newProgress = currentProgressValue + increment
      } else {
        newProgress = (diaryLikesCount || 0) + photoLikesCount
        console.log(`[updateAchievement] like_master: ${diaryLikesCount || 0} diary likes + ${photoLikesCount} photo likes = ${newProgress} total`)
      }
      
    } else if (data.achievement_type === "comment_king") {
      // Count total comments from both diary_entries (comment-*) and photo comments (source of truth)
      // Get diary comments count
      const { data: diaryComments, error: diaryError } = await supabase
        .from("diary_entries")
        .select("id")
        .like("id", "comment-%")
      
      // Get photo comments count
      const { count: photoCommentsCount, error: photoError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
      
      if (diaryError || photoError) {
        console.error(`[updateAchievement] Error counting comments:`, diaryError || photoError)
        // Fallback to increment if count fails
        const increment = data.progress_increment || 1
        newProgress = currentProgressValue + increment
      } else {
        const diaryCommentsCount = diaryComments?.length || 0
        newProgress = diaryCommentsCount + (photoCommentsCount || 0)
        console.log(`[updateAchievement] comment_king - Found ${diaryCommentsCount} diary comments + ${photoCommentsCount || 0} photo comments = ${newProgress} total`)
      }
      
    } else {
      // Normal increment for other achievements (if any)
      const increment = data.progress_increment || 1
      newProgress = currentProgressValue + increment
      console.log(`[updateAchievement] ${data.achievement_type} - Progress: ${currentProgressValue} + ${increment} = ${newProgress}`)
    }
    
    // Check which levels should be unlocked
    // CRITICAL: Only unlock levels that haven't been unlocked before
    // This prevents duplicate rewards when achievement is updated multiple times
    const newlyUnlockedLevels: number[] = []
    let totalReward = 0
    
    achievementDef.levels.forEach((level, index) => {
      // Check if this level is already in the unlocked list
      const isAlreadyUnlocked = unlockedLevels.includes(index)
      
      // Skip if already unlocked - prevents duplicate rewards
      if (isAlreadyUnlocked) {
        console.log(`[updateAchievement] Level ${index} already unlocked, skipping`)
        return
      }
      
      // Check if progress has reached the target for this level
      const hasReachedTarget = newProgress >= level.target
      
      if (hasReachedTarget) {
        // SIMPLIFIED: If not already unlocked and target reached -> unlock
        // This ensures rewards are given even if metadata is missing
        newlyUnlockedLevels.push(index)
        totalReward += level.reward
        console.log(`[updateAchievement] ✅ Unlocking NEW level ${index} (target: ${level.target}, current: ${newProgress}, reward: ${level.reward})`)
      }
    })
    
    const allUnlockedLevels = [...unlockedLevels, ...newlyUnlockedLevels]
    
    // Get claimed levels from metadata (levels that have been claimed by user)
    const claimedLevels: number[] = (currentProgress?.metadata as any)?.claimed_levels || []
    
    const maxTarget = Math.max(...achievementDef.levels.map(l => l.target))
    const isFullyUnlocked = newProgress >= maxTarget
    
    // Calculate pending reward (unlocked but not claimed)
    const pendingReward = allUnlockedLevels
      .filter(levelIndex => !claimedLevels.includes(levelIndex))
      .reduce((sum, levelIndex) => {
        return sum + (achievementDef.levels[levelIndex]?.reward || 0)
      }, 0)
    
    console.log(`[updateAchievement] 📊 Summary: progress=${newProgress}, newlyUnlocked=${newlyUnlockedLevels.length} levels`)
    if (newlyUnlockedLevels.length > 0) {
      console.log(`[updateAchievement] 🎁 New rewards available: ${pendingReward} nước (${allUnlockedLevels.length - claimedLevels.length} levels pending)`)
    }
    
    // Update achievement progress - use insert with onConflict for composite unique key
    // NOTE: Rewards are NOT automatically awarded - user must claim them manually
    const upsertData = {
      couple_id: COUPLE_ID,
      achievement_type: data.achievement_type,
      progress: newProgress,
      target: maxTarget,
      unlocked: isFullyUnlocked,
      unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : (currentProgress?.unlocked_at || null),
      metadata: { 
        unlocked_levels: allUnlockedLevels,
        claimed_levels: claimedLevels // Keep existing claimed levels
      },
      updated_at: new Date().toISOString(),
    }
    
    // Try upsert - Supabase needs the unique constraint columns specified
    let updateSuccess = false
    let existing: any = null
    
    const { error: upsertError } = await supabase
      .from("achievements")
      .upsert(upsertData as any, {
        onConflict: "couple_id,achievement_type"
      })
    
    if (upsertError) {
      console.error(`[updateAchievement] Error upserting achievement:`, upsertError)
      // Fallback: try update first, then insert if not exists
      const { data: existingData, error: checkError } = await supabase
        .from("achievements")
        .select("id")
        .eq("couple_id", COUPLE_ID)
        .eq("achievement_type", data.achievement_type)
        .maybeSingle()
      
      if (checkError) {
        console.error(`[updateAchievement] Error checking existing:`, checkError)
        // Don't throw - continue to award water even if update fails
        console.warn(`[updateAchievement] Continuing without updating achievement record...`)
      } else {
        existing = existingData
      }
      
      if (existing) {
        // Update existing - try with metadata first, fallback without if column doesn't exist
        const updateData: any = {
          progress: newProgress,
          target: maxTarget,
          unlocked: isFullyUnlocked,
          unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : (currentProgress?.unlocked_at || null),
          updated_at: new Date().toISOString(),
        }
        
        // Only add metadata if we're sure the column exists (try-catch in upsert will handle)
        updateData.metadata = { unlocked_levels: allUnlockedLevels }
        
        const { error: updateError } = await supabase
          .from("achievements")
          .update(updateData)
          .eq("couple_id", COUPLE_ID)
          .eq("achievement_type", data.achievement_type)
        
        if (updateError) {
          console.error(`[updateAchievement] Error updating existing:`, updateError)
          // If metadata column doesn't exist, try update without it
          if (updateError.message?.includes("metadata")) {
            console.log(`[updateAchievement] Retrying update without metadata column`)
            const { error: retryError } = await supabase
              .from("achievements")
              .update({
                progress: newProgress,
                target: maxTarget,
                unlocked: isFullyUnlocked,
                unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : (currentProgress?.unlocked_at || null),
                updated_at: new Date().toISOString(),
              } as any)
              .eq("couple_id", COUPLE_ID)
              .eq("achievement_type", data.achievement_type)
            
            if (retryError) {
              console.error(`[updateAchievement] Error updating without metadata:`, retryError)
              // Don't throw - continue to award water
            } else {
              updateSuccess = true
              console.log(`[updateAchievement] Successfully updated achievement without metadata`)
            }
          } else {
            // Don't throw - continue to award water
            console.warn(`[updateAchievement] Update failed but continuing...`)
          }
        } else {
          updateSuccess = true
        }
      } else {
        // Insert new - ensure metadata field exists or use empty object
        const insertData = {
          ...upsertData,
          metadata: upsertData.metadata || { unlocked_levels: [] }
        }
        const { error: insertError } = await supabase
          .from("achievements")
          .insert(insertData as any)
        
        if (insertError) {
          console.error(`[updateAchievement] Error inserting new:`, insertError)
          // If metadata column doesn't exist, try without it
          if (insertError.message?.includes("metadata")) {
            console.log(`[updateAchievement] Retrying insert without metadata column`)
            const { error: retryError } = await supabase
              .from("achievements")
              .insert({
                couple_id: upsertData.couple_id,
                achievement_type: upsertData.achievement_type,
                progress: upsertData.progress,
                target: upsertData.target,
                unlocked: upsertData.unlocked,
                unlocked_at: upsertData.unlocked_at,
                updated_at: upsertData.updated_at,
              } as any)
            
            if (retryError) {
              console.error(`[updateAchievement] Error inserting without metadata:`, retryError)
              // Don't throw - continue to award water
            } else {
              updateSuccess = true
              console.log(`[updateAchievement] Successfully inserted achievement without metadata`)
            }
          } else {
            // Don't throw - continue to award water
            console.warn(`[updateAchievement] Insert failed but continuing...`)
          }
        } else {
          updateSuccess = true
        }
      }
    } else {
      updateSuccess = true
    }
    
    if (updateSuccess) {
      console.log(`[updateAchievement] ✅ Successfully updated achievement record: ${data.achievement_type}`)
    } else {
      console.warn(`[updateAchievement] ⚠️  Achievement record update had errors, but reward was already given`)
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

