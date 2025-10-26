// Lấy danh sách bài viết từ localStorage hoặc database
export async function getDiaryEntries() {
  if (typeof window === "undefined") return []

  try {
    // Try to load from database first
    const response = await fetch("/api/diary/load")
    if (response.ok) {
      const entries = await response.json()
      // Sync to localStorage
      localStorage.setItem("sharedDiary", JSON.stringify(entries))
      return entries
    }
  } catch (error) {
    console.error("[v0] Error loading from database:", error)
  }

  // Fallback to localStorage
  const data = localStorage.getItem("sharedDiary")
  return data ? JSON.parse(data) : []
}

// Lưu danh sách bài viết vào localStorage và database
export async function saveToStorage(entries: any[]) {
  if (typeof window === "undefined") return

  // Save to localStorage first
  localStorage.setItem("sharedDiary", JSON.stringify(entries))

  // Sync to database
  try {
    await fetch("/api/diary/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entries),
    })
    console.log("[v0] Diary synced to database")
  } catch (error) {
    console.error("[v0] Error syncing to database:", error)
  }
}

// Thêm bài viết mới
export async function saveDiaryEntry(entry: any) {
  const entries = await getDiaryEntries()
  entries.unshift(entry) // thêm bài mới lên đầu danh sách
  await saveToStorage(entries)
}

// Xóa bài viết theo ID
export async function deleteDiaryEntry(id: string) {
  const entries = await getDiaryEntries()
  const filtered = entries.filter((e: any) => e.id !== id)

  // Update localStorage immediately
  localStorage.setItem("sharedDiary", JSON.stringify(filtered))

  // Sync deletion to database
  try {
    await fetch("/api/diary/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    console.log("[v0] Diary entry deleted from database")
  } catch (error) {
    console.error("[v0] Error deleting from database:", error)
  }
}

export async function updateDiaryEntry(updatedEntry: any) {
  const entries = await getDiaryEntries()
  const index = entries.findIndex((e: any) => e.id === updatedEntry.id)
  if (index !== -1) {
    entries[index] = updatedEntry
    await saveToStorage(entries)
  }
}
