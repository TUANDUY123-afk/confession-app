import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, newTitle } = await request.json()

    if (!photoUrl || !newTitle) {
      return NextResponse.json({ error: "Missing photoUrl or newTitle" }, { status: 400 })
    }

    const supabase = getSupabaseClient()
    await supabase.from("photos").update({ title: newTitle }).eq("url", photoUrl)

    return NextResponse.json({
      success: true,
      title: newTitle,
    })
  } catch (error) {
    console.error("[v0] Update title error:", error)
    return NextResponse.json({ error: "Update failed", details: String(error) }, { status: 500 })
  }
}
