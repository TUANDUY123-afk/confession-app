import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function PATCH(req: Request) {
  try {
    const supabase = getSupabaseClient()
    // Get username from request body
    const body = await req.json().catch(() => ({}))
    const username = body.username || "default"
    
    console.log("Mark all as read for user:", username)
    
    // Update all notifications to add current user to read_by array
    const { data: notifications } = await supabase.from("notifications").select("id, read_by")
    
    if (notifications && notifications.length > 0) {
      const updates = notifications.map(notif => {
        const readByArray = notif.read_by || []
        // Add current user if not already in array
        if (!readByArray.includes(username)) {
          readByArray.push(username)
        }
        return supabase
          .from("notifications")
          .update({ read_by: readByArray })
          .eq("id", notif.id)
      })
      
      await Promise.all(updates)
    }
    
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("❌ [API] mark-all-read error:", err)
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 })
  }
}
