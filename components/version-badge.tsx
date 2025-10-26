"use client"

import { useState } from "react"
import { X } from "lucide-react"

interface VersionBadgeProps {
  version: string
}

export default function VersionBadge({ version }: VersionBadgeProps) {
  const [showChangelog, setShowChangelog] = useState(false)

  const changelog = [
    {
      version: `${version} (Current)`,
      items: [
        "Thêm nén ảnh cho Love Story",
        "Thêm hiệu ứng tim bay vào tất cả các trang",
        "Đổi cơ chế versioning từ 0.1.x sang v1, v2, v3",
        "Sửa lỗi hiển thị tên người đăng trong thông báo upload ảnh",
        "Thêm GitHub Actions để tự động tăng version",
        "Thêm version badge với changelog modal"
      ]
    },
    {
      version: "v1",
      items: [
        "Thêm nén ảnh tự động khi upload (giảm 85% kích thước)",
        "Fix upload ảnh qua API route (sử dụng service role key)",
        "Fix Vercel memory limit (từ 3008MB → 1024MB)",
        "Tự động tăng phiên bản mỗi lần deploy",
        "Upload ảnh qua /api/upload-photo với compression",
        "Nén ảnh > 2MB trước khi upload",
        "Hiển thị version trong UI"
      ]
    }
  ]

  return (
    <>
      {/* Version Badge */}
      <div className="absolute top-4 left-4 z-50">
        <button
          onClick={() => setShowChangelog(true)}
          className="bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg hover:bg-pink-600 transition-colors cursor-pointer"
        >
          {version}
        </button>
      </div>

      {/* Changelog Modal */}
      {showChangelog && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          onClick={() => setShowChangelog(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-xl font-bold flex items-center gap-2">
                📝 Thay đổi phiên bản
              </h2>
              <button
                onClick={() => setShowChangelog(false)}
                className="text-white hover:text-gray-200 transition"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {changelog.map((item, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-bold text-pink-600 mb-3">
                    {item.version}
                  </h3>
                  <ul className="space-y-2">
                    {item.items.map((change, changeIdx) => (
                      <li key={changeIdx} className="flex items-start gap-2 text-gray-700">
                        <span className="text-green-500 mt-1">✅</span>
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
