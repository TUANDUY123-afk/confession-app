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
    description: "Like bài nhật ký",
    icon: "❤️",
    levels: [
      { target: 5, reward: 30, label: "Giai đoạn 1" },
      { target: 15, reward: 60, label: "Giai đoạn 2" },
      { target: 30, reward: 100, label: "Giai đoạn 3" },
      { target: 50, reward: 150, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "comment_king",
    name: "Bình luận viên",
    description: "Comment bài nhật ký",
    icon: "💬",
    levels: [
      { target: 3, reward: 30, label: "Giai đoạn 1" },
      { target: 10, reward: 60, label: "Giai đoạn 2" },
      { target: 20, reward: 100, label: "Giai đoạn 3" },
      { target: 35, reward: 150, label: "Giai đoạn 4" },
    ],
  },
  {
    type: "photo_collector",
    name: "Người kể chuyện",
    description: "Upload ảnh kỷ niệm",
    icon: "📸",
    levels: [
      { target: 3, reward: 40, label: "Giai đoạn 1" },
      { target: 10, reward: 80, label: "Giai đoạn 2" },
      { target: 20, reward: 120, label: "Giai đoạn 3" },
      { target: 35, reward: 180, label: "Giai đoạn 4" },
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
      const unlockedLevels = (progress?.metadata as any)?.unlocked_levels || []
      
      // Calculate which levels are unlocked
      const levelsStatus = def.levels.map((level, index) => {
        const isUnlocked = unlockedLevels.includes(index) || currentProgress >= level.target
        return {
          ...level,
          levelIndex: index,
          isUnlocked,
        }
      })
      
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
    
    // Special handling for daily_diary and love_garden_bloom
    let newProgress = (currentProgress?.progress || 0)
    if (achievement_type === "daily_diary") {
      // Get current streak from love_points
      const { data: pointsData } = await supabase
        .from("love_points")
        .select("current_streak")
        .eq("couple_id", COUPLE_ID)
        .maybeSingle()
      
      const currentStreak = pointsData?.current_streak || 0
      newProgress = currentStreak // Don't cap, allow to see all progress
    } else if (achievement_type === "love_garden_bloom") {
      // Check how many flowers are at stage 3 (Nở Rộ)
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
    } else {
      // Normal increment for other achievements
      newProgress = (currentProgress?.progress || 0) + progress_increment
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
    
    // Update achievement progress
    const { data, error } = await supabase
      .from("achievements")
      .upsert({
        couple_id: COUPLE_ID,
        achievement_type,
        progress: newProgress,
        target: maxTarget,
        unlocked: isFullyUnlocked,
        unlocked_at: newlyUnlockedLevels.length > 0 ? new Date().toISOString() : currentProgress?.unlocked_at,
        metadata: { unlocked_levels: allUnlockedLevels },
        updated_at: new Date().toISOString(),
      } as any)
      .select()
      .single()
    
    if (error) {
      console.error("Error updating achievement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Award water for newly unlocked levels
    if (totalReward > 0) {
      await supabase.from("love_points").update({
        water: supabase.raw(`water + ${totalReward}`),
      }).eq("couple_id", COUPLE_ID)
      
      // Log the points
      await supabase.from("activity_log").insert({
        couple_id: COUPLE_ID,
        activity_type: "achievement_unlock",
        points_awarded: totalReward,
        description: `Mở khóa ${newlyUnlockedLevels.length} giai đoạn thành tích: ${achievementDef.name}`,
        metadata: { achievement_type, unlocked_levels: newlyUnlockedLevels },
      })
    }
    
    return NextResponse.json({ 
      data, 
      unlockedLevels: newlyUnlockedLevels,
      totalReward,
      progress: newProgress
    })
  } catch (err) {
    console.error("Error in POST /api/gamification/achievements:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
