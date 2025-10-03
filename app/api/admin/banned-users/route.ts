import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    // Get banned users from public.banned_users and join auth.users for profile fields
    const { data, error } = await supabase
      .from("banned_users")
      .select(
        `user_id, reason, expires_at, created_at,
         user:auth.users!inner(id, email, raw_user_meta_data)`
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching banned users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to legacy shape expected by the front-end banned users page
    // id -> user_id, ban_reason -> reason, ban_expiration -> expires_at
    const users = (data || []).map((row: any) => {
      // Attempt to pull gamer_tag and discord_name from raw_user_meta_data if present
      const meta = (row.user?.raw_user_meta_data as any) || {}
      return {
        id: row.user_id,
        email: row.user?.email || null,
        gamer_tag: meta.gamer_tag || meta.gamertag || null,
        gamer_tag_id: meta.gamer_tag_id || null,
        discord_name: meta.discord_name || null,
        ban_reason: row.reason,
        ban_expiration: row.expires_at,
        created_at: row.created_at,
      }
    })

    console.log("Found banned users:", users.length) // Debug log
    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error in banned-users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

