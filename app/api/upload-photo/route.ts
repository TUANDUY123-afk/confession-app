import { getSupabaseClient } from "@/lib/supabase-client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = (formData.get("title") as string) || file.name.replace(/\.[^/.]+$/, "")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB for large photos from iOS
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File size exceeds 50MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB` },
        { status: 413 },
      )
    }

    console.log("[v0] Uploading file:", file.name, "type:", file.type, "size:", file.size, "dimensions check needed")

    const supabase = getSupabaseClient()
    const timestamp = Date.now()
    const filename = `photos/${timestamp}-${file.name}`
    const buffer = await file.arrayBuffer()

    let uploadedUrl: string
    try {
      const { data, error } = await supabase.storage.from("photos").upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

      if (error) {
        console.error("[v0] Supabase Storage error:", error)
        return NextResponse.json({ error: "Failed to upload file to storage. Please try again." }, { status: 500 })
      }

      const { data: publicUrlData } = supabase.storage.from("photos").getPublicUrl(data.path)

      uploadedUrl = publicUrlData.publicUrl
      console.log("[v0] Supabase Storage upload success:", uploadedUrl)
    } catch (storageError) {
      console.error("[v0] Storage API error details:", {
        message: storageError instanceof Error ? storageError.message : String(storageError),
        name: storageError instanceof Error ? storageError.name : "Unknown",
      })
      return NextResponse.json({ error: "Failed to upload file to storage. Please try again." }, { status: 500 })
    }

    try {
      await supabase.from("photos").insert({
        url: uploadedUrl,
        title,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      })
    } catch (dbError) {
      console.error("[v0] Database error:", dbError instanceof Error ? dbError.message : String(dbError))
      return NextResponse.json({ error: "Failed to save photo metadata" }, { status: 500 })
    }

    const responseData = {
      url: uploadedUrl,
      title,
      filename: file.name,
      uploadedAt: new Date().toISOString(),
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[v0] Upload error:", error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 })
  }
}
