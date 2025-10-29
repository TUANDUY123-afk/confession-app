import { NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase-client"

export async function DELETE() {
  try {
    const supabase = getSupabaseClient()
    // Delete all notifications using a different approach
    // First, get all notification IDs
    const { data: allNotifications, error: fetchError } = await supabase
      .from("notifications")
      .select("id")
    
    if (fetchError) throw fetchError
    
    // Delete all by their IDs
    if (allNotifications && allNotifications.length > 0) {
      const ids = allNotifications.map(n => n.id)
      const { error: deleteError } = await supabase
        .from("notifications")
        .delete()
        .in("id", ids)
      
      if (deleteError) throw deleteError
    }
    
    return NextResponse.json({ success: true, deleted: allNotifications?.length || 0 })
  } catch (err) {
    console.error("Error deleting all notifications:", err)
    return NextResponse.json({ error: "Failed to delete all notifications" }, { status: 500 })
  }
}

