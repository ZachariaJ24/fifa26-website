import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const clubId = searchParams.get("club_id")
    const date = searchParams.get("date")

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

    let query = supabase
      .from("clubs")
      .select(`
        id,
        name,
        short_name,
        availability,
        is_active
      `)

    if (clubId) {
      query = query.eq("id", clubId)
    }

    const { data: clubs, error } = await query

    if (error) {
      console.error("Error fetching club availability:", error)
      return NextResponse.json({ error: "Failed to fetch club availability" }, { status: 500 })
    }

    // If a specific date is requested, check for scheduled games
    if (date && clubs) {
      const { data: games } = await supabase
        .from("games")
        .select(`
          id,
          home_club_id,
          away_club_id,
          scheduled_time,
          status
        `)
        .gte("scheduled_time", `${date}T00:00:00`)
        .lt("scheduled_time", `${date}T23:59:59`)

      // Mark clubs as unavailable if they have games on that date
      const clubsWithAvailability = clubs.map(club => {
        const hasGame = games?.some(game => 
          game.home_club_id === club.id || game.away_club_id === club.id
        )
        
        return {
          ...club,
          available_on_date: !hasGame,
          scheduled_games: games?.filter(game => 
            game.home_club_id === club.id || game.away_club_id === club.id
          ) || []
        }
      })

      return NextResponse.json(clubsWithAvailability)
    }

    return NextResponse.json(clubs || [])
  } catch (error: any) {
    console.error("Error in club availability API:", error)
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
    const { club_id, availability } = body

    if (!club_id) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 })
    }

    if (!availability) {
      return NextResponse.json({ error: "Availability data is required" }, { status: 400 })
    }

    // Update club availability
    const { data: club, error } = await supabase
      .from("clubs")
      .update({
        availability: availability,
        updated_at: new Date().toISOString()
      })
      .eq("id", club_id)
      .select(`
        id,
        name,
        availability
      `)
      .single()

    if (error) {
      console.error("Error updating club availability:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(club)
  } catch (error: any) {
    console.error("Error in update club availability API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
