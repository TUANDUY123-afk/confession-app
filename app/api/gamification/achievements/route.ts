import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

const COUPLE_ID = "default_couple"

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    type: "event_on_time",
    name: "Cặp đôi đúng giờ",
    description: "Tham gia 5 sự kiện liên tiếp đúng giờ",
    icon: "🕒",
    target: 5,
    points_reward: 100,
  },
  {
    type: "daily_message",
    name: "Ngọt ngào mỗi ngày",
    description: "Gửi tin nhắn yêu thương 7 ngày liên tục",
    icon: "💌",
    target: 7,
    points_reward: 150,
  },
  {
    type: "100_days_streak",
    name: "100 ngày không quên hẹn",
    description: "Không bỏ lỡ sự kiện nào trong 100 ngày",
    icon: "🏅",
    target: 100,
    points_reward: 500,
  },
  {
    type: "tree_level_4",
    name: "Cây tình yêu nở hoa",
    description: "Cây đạt cấp độ 4",
    icon: "🌸",
    target: 1,
    points_reward: 200,
  },
  {
    type: "photo_collector",
    name: "Người kể chuyện",
    description: "Thêm 20 ảnh vào timeline",
    icon: "📷",
    target: 20,
    points_reward: 300,
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
    
    // Merge with achievement definitions
    const achievementsWithDef = ACHIEVEMENTS.map(def => {
      const progress = data?.find(a => a.achievement_type === def.type)
      return {
        ...def,
        progress: progress?.progress || 0,
        target: def.target,
        unlocked: progress?.unlocked || false,
        unlocked_at: progress?.unlocked_at,
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
      .single()
    
    const newProgress = (currentProgress?.progress || 0) + progress_increment
    const isUnlocked = newProgress >= achievementDef.target && !currentProgress?.unlocked
    
    // Update achievement progress
    const { data, error } = await supabase
      .from("achievements")
      .upsert({
        couple_id: COUPLE_ID,
        achievement_type,
        progress: newProgress,
        target: achievementDef.target,
        unlocked: isUnlocked || currentProgress?.unlocked || false,
        unlocked_at: isUnlocked ? new Date().toISOString() : currentProgress?.unlocked_at,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error("Error updating achievement:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // If unlocked, award bonus points
    if (isUnlocked) {
      await supabase.from("love_points").update({
        total_points: supabase.raw(`total_points + ${achievementDef.points_reward}`),
      }).eq("couple_id", COUPLE_ID)
      
      // Log the points
      await supabase.from("activity_log").insert({
        couple_id: COUPLE_ID,
        activity_type: "achievement_unlock",
        points_awarded: achievementDef.points_reward,
        description: `Unlocked achievement: ${achievementDef.name}`,
        metadata: { achievement_type },
      })
    }
    
    return NextResponse.json({ data, unlocked: isUnlocked })
  } catch (err) {
    console.error("Error in POST /api/gamification/achievements:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
