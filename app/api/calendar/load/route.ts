import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Calendar now only shows love_events (managed by love-events API)
    // Milestones and diary entries are displayed in their respective pages
    return NextResponse.json({ data: [] })
  } catch (err) {
    console.error("Error loading calendar events:", err)
    return NextResponse.json({ data: [] })
  }
}

