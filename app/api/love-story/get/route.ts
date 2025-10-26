import { NextResponse } from "next/server"

// For now, we'll use a simple in-memory store
// In production, this would connect to a database
const loveStoryData: any = null

export async function GET() {
  try {
    // In a real app, this would fetch from a database
    // For now, return default data or stored data
    if (!loveStoryData) {
      return NextResponse.json({
        story: {
          startDate: new Date().toISOString().split("T")[0],
          partnerName: "",
          title: "Hãy để thời gian có ý nghĩa hơn cùng nhau",
        },
        milestones: [
          { id: "100", days: 100, label: "100 ngày", completed: false },
          { id: "365", days: 365, label: "Kỷ niệm 1 năm", completed: false },
          { id: "500", days: 500, label: "500 ngày", completed: false },
          { id: "730", days: 730, label: "Kỷ niệm 2 năm", completed: false },
          { id: "1000", days: 1000, label: "1000 ngày", completed: false },
        ],
        events: [],
      })
    }
    return NextResponse.json(loveStoryData)
  } catch (error) {
    console.error("[v0] Error fetching love story:", error)
    return NextResponse.json({ error: "Failed to fetch love story" }, { status: 500 })
  }
}
