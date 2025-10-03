import { createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const weekStart = searchParams.get("weekStart")
    const weekEnd = searchParams.get("weekEnd")
    const seasonId = searchParams.get("seasonId")

    if (!weekStart || !weekEnd) {
      return NextResponse.json({ error: "weekStart and weekEnd are required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Get clubs with their players and availability data
    const { data: clubs, error: clubsError } = await supabase
      .from("clubs")
      .select(`
        id,
        name,
        logo_url,
        players:club_players(
          id,
          user_id,
          users!inner(
            id,
            gamer_tag,
            primary_position,
            secondary_position
          )
        )
      `)
      .eq("is_active", true)

    if (clubsError) {
      console.error("Error fetching clubs:", clubsError)
      return NextResponse.json({ error: clubsError.message }, { status: 500 })
    }

    // Get matches for the specified week
    const { data: matches, error: matchesError } = await supabase
      .from("games")
      .select(`
        id,
        home_club_id,
        away_club_id,
        scheduled_time,
        status,
        home_score,
        away_score,
        home_club:clubs!home_club_id(id, name),
        away_club:clubs!away_club_id(id, name)
      `)
      .gte("scheduled_time", weekStart)
      .lte("scheduled_time", weekEnd)
      .order("scheduled_time")

    if (matchesError) {
      console.error("Error fetching matches:", matchesError)
      return NextResponse.json({ error: matchesError.message }, { status: 500 })
    }

    // Get seasons data
    const { data: seasons, error: seasonsError } = await supabase
      .from("seasons")
      .select("*")
      .order("season_number", { ascending: false })

    if (seasonsError) {
      console.error("Error fetching seasons:", seasonsError)
      return NextResponse.json({ error: seasonsError.message }, { status: 500 })
    }

    // Process the data to match the expected format
    const processedClubs = (clubs || []).map(club => ({
      id: club.id,
      name: club.name,
      logoUrl: club.logo_url,
      players: (club.players || []).map(player => ({
        id: player.id,
        userId: player.user_id,
        name: player.users?.gamer_tag || "Unknown",
        gamerTag: player.users?.gamer_tag || "Unknown",
        gamesPlayed: 0, // This would need to be calculated from actual game data
        availability: [], // This would need to be fetched from availability data
        availableCount: 0,
        unavailableCount: 0,
        injuryReserveCount: 0,
        noResponseCount: 0,
        isOnIR: false
      })),
      matches: []
    }))

    const currentSeason = seasons?.[0] || null

    return NextResponse.json({
      clubs: processedClubs,
      matches: matches || [],
      seasons: seasons || [],
      currentSeasonId: currentSeason?.id || "",
      currentSeasonName: currentSeason?.name || "Current Season",
      weekStart,
      weekEnd
    })

  } catch (error: any) {
    console.error("Error in club-availability API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
