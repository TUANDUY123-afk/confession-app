import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("[v0] Saving love story data:", data)

    const supabase = getSupabaseClient()

    // First, get the existing record to check if we need to update or insert
    const { data: existingData } = await supabase.from("love_story").select("id").limit(1)

    if (existingData && existingData.length > 0) {
      // Update existing record
      await supabase
        .from("love_story")
        .update({
          data: data,
        })
        .eq("id", existingData[0].id)
    } else {
      // Insert new record
      await supabase.from("love_story").insert({
        data: data,
      })
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Error saving love story:", error)
    return NextResponse.json({ error: "Failed to save love story" }, { status: 500 })
  }
}
