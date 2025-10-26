import { createClient } from "@supabase/supabase-js"

let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables")
    }

    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return supabaseClient
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get: (target, prop) => {
    const client = getSupabaseClient()
    return client[prop as keyof typeof client]
  },
})
