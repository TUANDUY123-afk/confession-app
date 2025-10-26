import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("[v0] Updating love story:", data)

    // In a real app, this would save to a database
    // For now, we'll just return success
    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Error updating love story:", error)
    return NextResponse.json({ error: "Failed to update love story" }, { status: 500 })
  }
}
