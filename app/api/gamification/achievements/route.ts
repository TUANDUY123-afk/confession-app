import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

// Achievement level structure: { target, reward }
type AchievementLevel = { target: number; reward: number; label: string }

interface AchievementDef {
  type: string
  name: string
  description: string
  icon: string
  levels: AchievementLevel[]
}

// Achievement definitions with multiple levels
export const ACHIEVEMENTS: AchievementDef[] = [
  {
    type: "daily_diary",
    name: "Người viết nhật ký",
    description: "Viết nhật ký liên tục",
    icon: "📝",
    levels: [
      { target: 3, reward: 50, label: "Giai đoạn 1" },
      { target: 7, reward: 100, label: "Giai đoạn 2" },
      { target: 14, reward: 150, label: "Giai đoạn 3" },
      { target: 30, reward: 200, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "like_master",
    name: "Trái tim nồng nàn",
    description: "Like bài nhật ký và ảnh",
    icon: "❤️",
    levels: [
      { target: 10, reward: 40, label: "Giai đoạn 1" },
      { target: 25, reward: 80, label: "Giai đoạn 2" },
      { target: 50, reward: 150, label: "Giai đoạn 3" },
      { target: 100, reward: 250, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "comment_king",
    name: "Bình luận viên",
    description: "Comment bài nhật ký và ảnh",
    icon: "💬",
    levels: [
      { target: 5, reward: 40, label: "Giai đoạn 1" },
      { target: 15, reward: 80, label: "Giai đoạn 2" },
      { target: 30, reward: 150, label: "Giai đoạn 3" },
      { target: 50, reward: 250, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "photo_collector",
    name: "Người kể chuyện",
    description: "Upload ảnh kỷ niệm",
    icon: "📸",
    levels: [
      { target: 5, reward: 50, label: "Giai đoạn 1" },
      { target: 15, reward: 100, label: "Giai đoạn 2" },
      { target: 30, reward: 180, label: "Giai đoạn 3" },
      { target: 50, reward: 300, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "love_garden_bloom",
    name: "Vườn tình yêu nở hoa",
    description: "Hoa đạt giai đoạn Nở Rộ",
    icon: "🌺",
    levels: [
      { target: 1, reward: 80, label: "Giai đoạn 1" },
      { target: 2, reward: 150, label: "Giai đoạn 2" },
      { target: 3, reward: 220, label: "Giai đoạn 3" },
      { target: 5, reward: 300, label: "Giai đoạn 4" },
    ],
  },
]

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    const { data, error } = await supabase
      .from("achievements")
      .select("*")
      .eq("couple_id", COUPLE_ID)
    
    if (error) {
      console.error("Error fetching achievements:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Merge with achievement definitions and calculate level progress
    const achievementsWithDef = ACHIEVEMENTS.map(def => {
      const progress = data?.find(a => a.achievement_type === def.type)
      const currentProgress = progress?.progress || 0
      
      // Get unlocked levels and claimed levels from metadata
      let unlockedLevels: number[] = []
      let claimedLevels: number[] = []
      if (progress?.metadata) {
        const metadata = progress.metadata as any
        if (Array.isArray(metadata.unlocked_levels)) {
          unlockedLevels = metadata.unlocked_levels
        } else if (metadata.unlocked_levels) {
          unlockedLevels = [metadata.unlocked_levels]
        }
        if (Array.isArray(metadata.claimed_levels)) {
          claimedLevels = metadata.claimed_levels
        }
      }
      
      // Calculate which levels are unlocked and which are claimed
      const levelsStatus = def.levels.map((level, index) => {
        const isUnlocked = unlockedLevels.includes(index) || currentProgress >= level.target
        const isClaimed = claimedLevels.includes(index)
        return {
          ...level,
          levelIndex: index,
          isUnlocked,
          isClaimed,
        }
      })
      
      // Calculate pending reward (unlocked but not claimed)
      const pendingReward = levelsStatus
        .filter(l => l.isUnlocked && !l.isClaimed)
        .reduce((sum, l) => sum + l.reward, 0)
      
      // Find current level (highest unlocked)
      const currentLevelIndex = levelsStatus
        .map((l, i) => l.isUnlocked ? i : -1)
        .filter(i => i >= 0)
        .sort((a, b) => b - a)[0] ?? -1
      
      const nextLevel = currentLevelIndex < def.levels.length - 1 
        ? def.levels[currentLevelIndex + 1] 
        : null
      
      return {
        type: def.type,
        name: def.name,
        description: def.description,
        icon: def.icon,
        progress: currentProgress,
        levels: def.levels,
        levelsStatus,
        currentLevelIndex: currentLevelIndex >= 0 ? currentLevelIndex : -1,
        nextLevel,
        totalLevels: def.levels.length,
        pendingReward, // Total reward available to claim
        claimedLevels, // Array of claimed level indices
      }
    })
    
    return NextResponse.json(achievementsWithDef)
  } catch (err) {
    console.error("Error in GET /api/gamification/achievements:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { achievement_type, progress_increment = 1 } = body
    
    if (!achievement_type) {
      return NextResponse.json({ error: "Missing achievement_type" }, { status: 400 })
    }
    
    // Get achievement definition
    const achievementDef = ACHIEVEMENTS.find(a => a.type === achievement_type)
    if (!achievementDef) {
      return NextResponse.json({ error: "Invalid achievement type" }, { status: 400 })
    }
    
    // Get current progress
    const { data: currentProgress } = await supabase
      .from("achievements")
      .select("*")
      .eq("couple_id", COUPLE_ID)
      .eq("achievement_type", achievement_type)
      .maybeSingle()
    
    const unlockedLevels = (currentProgress?.metadata as any)?.unlocked_levels || []
    
    // Special handling for different achievement types
    let newProgress = (currentProgress?.progress || 0)
    
    if (achievement_type === "daily_diary") {
      // Get current streak from love_points (tracked dynamically)
      const { data: pointsData } = await supabase
        .from("love_points")
        .select("current_streak")
        .eq("couple_id", COUPLE_ID)
        .maybeSingle()
      
      const currentStreak = pointsData?.current_streak || 0
      newProgress = currentStreak // Dynamic: always check from source of truth
      console.log(`[Achievement] daily_diary: Using streak ${currentStreak}`)
      
    } else if (achievement_type === "love_garden_bloom") {
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
          }
          
          if (flower.points >= stage3Threshold) {
            flowersAtStage3++
          }
        }
      }
      
      newProgress = flowersAtStage3
      console.log(`[Achievement] love_garden_bloom: ${flowersAtStage3} flowers at stage 3`)
      
    } else if (achievement_type === "photo_collector") {
      // Count actual photos from database (source of truth)
      const { count, error: countError } = await supabase
        .from("photos")
        .select("*", { count: "exact", head: true })
      
      if (countError) {
        console.error(`[Achievement] Error counting photos:`, countError)
        // Fallback to increment if count fails
        newProgress = (currentProgress?.progress || 0) + progress_increment
      } else {
        newProgress = count || 0
        console.log(`[Achievement] photo_collector: Found ${count} photos in database`)
      }
      
    } else if (achievement_type === "like_master") {
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
        console.log(`[Achievement] like_master: Filtered ${photoLikes.length} photo entries, total likes: ${photoLikesCount}`)
      } else if (photoError) {
        console.error(`[Achievement] Error fetching photo likes:`, photoError)
      }
      
      if (diaryError) {
        console.error(`[Achievement] Error counting diary likes:`, diaryError)
        // Fallback to increment if count fails
        newProgress = (currentProgress?.progress || 0) + progress_increment
      } else {
        newProgress = (diaryLikesCount || 0) + photoLikesCount
        console.log(`[Achievement] like_master: ${diaryLikesCount || 0} diary likes + ${photoLikesCount} photo likes = ${newProgress} total`)
      }
      
    } else if (achievement_type === "comment_king") {
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
        console.error(`[Achievement] Error counting comments:`, diaryError || photoError)
        // Fallback to increment if count fails
        newProgress = (currentProgress?.progress || 0) + progress_increment
      } else {
        const diaryCommentsCount = diaryComments?.length || 0
        newProgress = diaryCommentsCount + (photoCommentsCount || 0)
        console.log(`[Achievement] comment_king: Found ${diaryCommentsCount} diary comments + ${photoCommentsCount || 0} photo comments = ${newProgress} total`)
      }
      
    } else {
      // Normal increment for other achievements (if any)
      newProgress = (currentProgress?.progress || 0) + progress_increment
      console.log(`[Achievement] ${achievement_type}: Incrementing by ${progress_increment}`)
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
    
    console.log(`[Achievement API] 📊 Summary: progress=${newProgress}, newlyUnlocked=${newlyUnlockedLevels.length} levels`)
    if (newlyUnlockedLevels.length > 0) {
      console.log(`[Achievement API] 🎁 New rewards available: ${pendingReward} nước (${allUnlockedLevels.length - claimedLevels.length} levels pending)`)
    }
    
    // Update achievement progress
    // NOTE: Rewards are NOT automatically awarded - user must claim them manually
    const { data, error } = await supabase
      .from("achievements")
      .upsert({
        couple_id: COUPLE_ID,
        achievement_type,
        progress: newProgress,
        target: maxTarget,
        unlocked: isFullyUnlocked,
        unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : currentProgress?.unlocked_at,
        metadata: { 
          unlocked_levels: allUnlockedLevels,
          claimed_levels: claimedLevels // Keep existing claimed levels
        },
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()
    
    if (error) {
      console.error("[Achievement API] Error updating achievement record:", error)
      return NextResponse.json({ 
        error: error.message,
        unlockedLevels: newlyUnlockedLevels,
        progress: newProgress,
        pendingReward
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      data, 
      unlockedLevels: newlyUnlockedLevels,
      claimedLevels,
      pendingReward,
      progress: newProgress
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/achievements:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
