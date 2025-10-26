import { readFileSync, writeFileSync } from "fs"
import { join } from "path"

// Đọc file page.tsx
const pagePath = join(process.cwd(), "app", "page.tsx")
const content = readFileSync(pagePath, "utf-8")

// Tìm và tăng version
const versionMatch = content.match(/const APP_VERSION = "(v\d+)"/)
if (versionMatch) {
  const currentVersion = versionMatch[1]
  const versionNumber = parseInt(currentVersion.replace("v", ""))
  const newVersion = `v${versionNumber + 1}`
  
  const updatedContent = content.replace(
    /const APP_VERSION = "[^"]+"/,
    `const APP_VERSION = "${newVersion}"`
  )
  
  writeFileSync(pagePath, updatedContent, "utf-8")
  console.log(`Version updated from ${currentVersion} to ${newVersion}`)
} else {
  console.log("Could not find APP_VERSION in page.tsx")
}


