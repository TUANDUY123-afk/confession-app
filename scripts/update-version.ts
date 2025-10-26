import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

function incrementVersion(version: string): string {
  const parts = version.split('.')
  let major = parseInt(parts[0])
  let minor = parseInt(parts[1])
  let patch = parseInt(parts[2])

  // Increment patch version
  patch++
  
  // If patch exceeds 99, increment minor
  if (patch > 99) {
    patch = 0
    minor++
  }
  
  // If minor exceeds 99, increment major
  if (minor > 99) {
    minor = 0
    major++
  }

  return `${major}.${minor}.${patch}`
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
      /const APP_VERSION = "v\d+\.\d+\.\d+"/,
      `const APP_VERSION = "v${newVersion}"`
    )
    writeFileSync(pageTsxPath, updatedContent, 'utf-8')
    
    console.log(`✅ Version updated in app/page.tsx: v${oldVersion} → v${newVersion}`)
    
    // Return new version for Vercel
    process.stdout.write(newVersion)
  } catch (error) {
    console.error('❌ Error updating version:', error)
    process.exit(1)
  }
}

main()


