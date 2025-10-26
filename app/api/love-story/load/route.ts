import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("[v0] Loading love story data")

    const supabase = getSupabaseClient()

    let retries = 3
    let lastError: any = null

    while (retries > 0) {
      try {
        const { data: result, error } = await supabase
          .from("love_story")
          .select("data")
          .order("created_at", { ascending: false })
          .limit(1)

        if (error) {
          lastError = error
          retries--
          if (retries > 0) {
            await new Promise((resolve) => setTimeout(resolve, 500))
            continue
          }
          throw error
        }

        if (result && result.length > 0) {
          const data = result[0].data
          console.log("[v0] Love story data loaded successfully")
          return NextResponse.json({
            success: true,
            data: data,
          })
        }

        return NextResponse.json({
          success: false,
          data: null,
        })
      } catch (err) {
        lastError = err
        retries--
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.error("[v0] Error loading love story after retries:", lastError?.message)
    return NextResponse.json({
      success: false,
      data: null,
    })
  } catch (error) {
    console.error("[v0] Error loading love story:", error)
    return NextResponse.json({ error: "Failed to load love story" }, { status: 500 })
  }
}
