import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const eventId = formData.get("eventId") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 413 },
      )
    }

    console.log("[v0] Uploading event image:", file.name, "type:", file.type, "size:", file.size)

    const supabase = getSupabaseClient()
    const timestamp = Date.now()
    const filename = `event-images/${timestamp}-${file.name}`
    const buffer = await file.arrayBuffer()

    let uploadedUrl: string
    try {
      const { data, error } = await supabase.storage.from("photos").upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (error) {
        console.error("[v0] Supabase Storage error:", error)
        return NextResponse.json({ error: "Failed to upload file to storage." }, { status: 500 })
      }

      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(data.path)

      uploadedUrl = publicUrlData.publicUrl
      console.log("[v0] Event image uploaded:", uploadedUrl)
    } catch (storageError) {
      console.error("[v0] Storage API error details:", {
        message: storageError instanceof Error ? storageError.message : String(storageError),
      })
      return NextResponse.json({ error: "Failed to upload file to storage." }, { status: 500 })
    }

    return NextResponse.json({ url: uploadedUrl })
  } catch (error) {
    console.error("[v0] Upload error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Upload failed." }, { status: 500 })
  }
}

