import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()

    let retries = 3
    let lastError: any = null

    while (retries > 0) {
      try {
        const { data: entries, error } = await supabase
          .from("diary_entries")
          .select("*")
          .not("id", "like", "comment-%") // Exclude comments
          .order("date", { ascending: false })

        if (error) {
          lastError = error
          retries--
          if (retries > 0) {
            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, 500))
            continue
          }
          throw error
        }

        return NextResponse.json(entries || [])
      } catch (err) {
        lastError = err
        retries--
        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }
    }

    console.error("[v0] Supabase error after retries:", lastError?.message)
    return NextResponse.json([])
  } catch (error) {
    console.error("[v0] Error loading diary entries:", error instanceof Error ? error.message : String(error))
    return NextResponse.json([])
  }
}
