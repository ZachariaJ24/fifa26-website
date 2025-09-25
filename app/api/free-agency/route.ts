import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()

    // Get free agents (players not on any team)
    const { data: freeAgents, error } = await supabase
      .from("players")
      .select(`
        id,
        salary,
        users!inner (
          id,
          gamer_tag_id,
          primary_position,
          secondary_position,
          console,
          avatar_url
        )
      `)
      .is("team_id", null)
      .eq("users.is_active", true)

    if (error) {
      console.error("Error fetching free agents:", error)
      return NextResponse.json({ error: "Failed to fetch free agents" }, { status: 500 })
    }

    return NextResponse.json(freeAgents || [])
  } catch (error) {
    console.error("Error in free-agency API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
