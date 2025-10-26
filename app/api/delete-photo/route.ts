import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    const supabase = getSupabaseClient()

    // Extract the file path from the public URL
    const urlParts = url.split("/")
    const filename = urlParts[urlParts.length - 1]
    const filepath = `photos/${filename}`

    // Delete from Supabase Storage
    const { error: storageError } = await supabase.storage.from("photos").remove([filepath])

    if (storageError) {
      console.error("[v0] Storage deletion error:", storageError)
      return NextResponse.json({ error: "Failed to delete file from storage" }, { status: 500 })
    }

    // Delete from database
    const { error: dbError } = await supabase.from("photos").delete().eq("url", url)

    if (dbError) {
      console.error("[v0] Database deletion error:", dbError)
      return NextResponse.json({ error: "Failed to delete photo metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
