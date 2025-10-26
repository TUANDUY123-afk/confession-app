import { getSupabaseClient } from "@/lib/supabase-client"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = getSupabaseClient()
    
    // Get events from love_events table
    const { data: events, error } = await supabase
      .from("love_events")
      .select("*")
      .order("date", { ascending: true })

    if (error) {
      console.error("Error fetching love_events:", error)
      return NextResponse.json({ data: [] })
    }

    return NextResponse.json({ data: events || [] })
  } catch (error: any) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: "Failed to fetch events", details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const body = await request.json()
    const { title, date, description, image, type } = body

    console.log("Received event data:", {
      title,
      date,
      type,
      hasImage: !!image,
      imageLength: image?.length || 0
    })

    // Generate unique ID
    const eventId = Date.now().toString()

    // Image is now a URL (from Supabase Storage), not base64
    const finalImage = image || null

    // Insert new event into love_events table
    const { data: newEvent, error } = await supabase
      .from("love_events")
      .insert({
        id: eventId,
        title: title,
        date: date,
        type: type || "outing",
        description: description || null,
        image: finalImage,
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      throw error
    }

    console.log("Event created successfully:", newEvent?.id)
    return NextResponse.json({ data: newEvent })
  } catch (error: any) {
    console.error("Error adding event:", error)
    return NextResponse.json(
      { error: "Failed to add event", details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient()
    const { id } = await request.json()

    // Delete event from love_events table
    const { error } = await supabase
      .from("love_events")
      .delete()
      .eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting event:", error)
    return NextResponse.json(
      { error: "Failed to delete event", details: error.message },
      { status: 500 }
    )
  }
}
