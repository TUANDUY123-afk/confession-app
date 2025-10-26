import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { milestoneId, completed } = await request.json()
    console.log("[v0] Updating milestone:", milestoneId, completed)

    // In a real app, this would update the database
    return NextResponse.json({
      success: true,
      milestoneId,
      completed,
    })
  } catch (error) {
    console.error("[v0] Error updating milestone:", error)
    return NextResponse.json({ error: "Failed to update milestone" }, { status: 500 })
  }
}
