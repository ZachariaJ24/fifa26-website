import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    // Get banned users from public.users table (new schema)
    const { data, error } = await supabase
      .from("users")
      .select("id, email, gamer_tag_id, discord_name, ban_reason, ban_expiration, created_at")
      .eq("is_banned", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching banned users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to shape expected by the front-end
    const users = (data || []).map((user: any) => ({
      id: user.id,
      email: user.email || null,
      gamer_tag: user.gamer_tag_id || null,
      gamer_tag_id: user.gamer_tag_id || null,
      discord_name: user.discord_name || null,
      ban_reason: user.ban_reason,
      ban_expiration: user.ban_expiration,
      created_at: user.created_at,
    }))

    console.log("Found banned users:", users.length) // Debug log
    return NextResponse.json({ users })
  } catch (error: any) {
    console.error("Error in banned-users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

