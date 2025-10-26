import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorageBucket() {
  try {
    console.log("Setting up Supabase Storage bucket...")

    const { data, error } = await supabase.storage.createBucket("photos", {
      public: true,
      fileSizeLimit: 26214400, // 25MB
    })

    if (error) {
      // If bucket already exists, that's fine
      if (error.message.includes("already exists")) {
        console.log("✓ Photos bucket already exists")
      } else {
        console.error("Error creating bucket:", error)
        process.exit(1)
      }
    } else {
      console.log("✓ Photos bucket created successfully:", data)
    }

    const { error: policyError } = await supabase.storage.from("photos").createSignedUrl("test", 3600)

    if (!policyError) {
      console.log("✓ Storage bucket is properly configured")
    }

    console.log("\n✓ Storage setup complete!")
  } catch (error) {
    console.error("Setup failed:", error)
    process.exit(1)
  }
}

setupStorageBucket()
