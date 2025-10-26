export async function getCurrentUser() {
  if (typeof window === "undefined") return null

  let user = localStorage.getItem("lovable_user")

  // Nếu chưa có user hoặc giá trị là "Ẩn danh" thì hỏi lại
  if (!user || user === "Ẩn danh") {
    console.log("🧠 [Người dùng] Chưa có tên, hiển thị prompt...")
    const name = prompt("💖 Nhập tên của bạn:")?.trim()

    if (name && name.length > 0) {
      localStorage.setItem("lovable_user", name)
      user = name

      // 📡 Gửi tên này lên server để lưu
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        if (res.ok) {
          console.log("✅ [Người dùng] Đã đồng bộ tên với server:", name)
        } else {
          console.warn("⚠️ [Người dùng] Server không lưu được tên:", await res.text())
        }
      } catch (err) {
        console.warn("⚠️ [Người dùng] Không thể lưu tên lên server:", err)
      }
    } else {
      alert("⚠️ Bạn cần nhập tên để tiếp tục!")
      return await getCurrentUser() // hỏi lại cho tới khi nhập
    }
  }

  console.log("👤 [Người dùng hiện tại]:", user)
  return { name: user }
}
