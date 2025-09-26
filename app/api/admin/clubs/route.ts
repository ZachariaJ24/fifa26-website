import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // Fetch clubs with conference information
    const { data: clubs, error } = await supabase
      .from("clubs")
      .select(`
        *,
        conference:conferences(id, name, color)
      `)
      .order("name")

    if (error) {
      console.error("Error fetching clubs:", error)
      return NextResponse.json({ error: "Failed to fetch clubs" }, { status: 500 })
    }

    return NextResponse.json(clubs || [])
  } catch (error: any) {
    console.error("Error in clubs API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      short_name,
      logo_url,
      description,
      founded_year,
      home_stadium,
      website,
      social_media,
      contact_info,
      conference_id,
      division,
      is_active,
      availability
    } = body

    if (!name) {
      return NextResponse.json({ error: "Club name is required" }, { status: 400 })
    }

    // Create club with all the new fields
    const { data: club, error } = await supabase
      .from("clubs")
      .insert({
        name,
        short_name: short_name || null,
        logo_url: logo_url || null,
        description: description || null,
        founded_year: founded_year || null,
        home_stadium: home_stadium || null,
        website: website || null,
        social_media: social_media || {},
        contact_info: contact_info || {},
        conference_id: conference_id || null,
        division: division || "Premier Division",
        is_active: is_active !== undefined ? is_active : true,
        availability: availability || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false,
          preferred_times: ["20:30", "21:10", "21:50"],
          timezone: "EST"
        },
        // Initialize stats
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
        goals_for: 0,
        goals_against: 0,
        games_played: 0
      })
      .select(`
        *,
        conference:conferences(id, name, color)
      `)
      .single()

    if (error) {
      console.error("Error creating club:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(club, { status: 201 })
  } catch (error: any) {
    console.error("Error in create club API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
