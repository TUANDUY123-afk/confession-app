export default function MoodBackground({ mood }: { mood: string }) {
  // Mỗi mood có màu hoặc hiệu ứng riêng
  const bgMap: Record<string, string> = {
    "Hạnh phúc": "from-pink-300 to-rose-300",
    "Buồn": "from-blue-400 to-indigo-500",
    "Yêu thương": "from-red-300 to-pink-400",
    "Giận dỗi": "from-orange-300 to-red-400",
    "Nhớ nhung": "from-purple-300 to-fuchsia-400",
  }

  return (
    <div
      className={`absolute inset-0 bg-gradient-to-br ${bgMap[mood] || "from-gray-200 to-gray-300"} transition-all duration-500 -z-10`}
    />
  )
}
