import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function incrementVersion(version: string): string {
  // Extract current version number from "v1", "v2", etc.
  const versionMatch = version.match(/v(\d+)/)
  if (versionMatch) {
    const currentNumber = parseInt(versionMatch[1])
    const newNumber = currentNumber + 1
    return `v${newNumber}`
  }
  // If no version found, start at v1
  return "v1"
}

function main() {
  const packageJsonPath = join(process.cwd(), 'package.json')
  const pageTsxPath = join(process.cwd(), 'app', 'page.tsx')
  
  try {
    // Read package.json
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
    
    const oldVersion = packageJson.version
    const newVersion = incrementVersion(oldVersion)
    
    // Update version in package.json
    packageJson.version = newVersion
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')
    
    console.log(`✅ Version updated in package.json: ${oldVersion} → ${newVersion}`)
    
    // Update version in app/page.tsx
    const pageTsxContent = readFileSync(pageTsxPath, 'utf-8')
    const updatedContent = pageTsxContent.replace(
      /const APP_VERSION = "v\d+"/,
      `const APP_VERSION = "${newVersion}"`
    )
    writeFileSync(pageTsxPath, updatedContent, 'utf-8')
    
    console.log(`✅ Version updated in app/page.tsx: ${oldVersion} → ${newVersion}`)
    
    // Return new version for Vercel
    process.stdout.write(newVersion)
  } catch (error) {
    console.error('❌ Error updating version:', error)
    process.exit(1)
  }
}

main()


