import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "daily" // daily, transfers, matches
    const date = searchParams.get("date")

    const targetDate = date ? new Date(date) : new Date()
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0))
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999))

    if (type === "daily") {
      // Get daily recap data
      const recapData = await getDailyRecap(supabase, startOfDay, endOfDay)
      return NextResponse.json(recapData)
    }

    if (type === "transfers") {
      // Get transfer recap data
      const transferData = await getTransferRecap(supabase, startOfDay, endOfDay)
      return NextResponse.json(transferData)
    }

    if (type === "matches") {
      // Get match recap data
      const matchData = await getMatchRecap(supabase, startOfDay, endOfDay)
      return NextResponse.json(matchData)
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Error fetching recap:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function getDailyRecap(supabase: any, startDate: Date, endDate: Date) {
  // Get completed matches
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status,
      match_date,
      home_team:teams!home_team_id(
        id,
        name,
        logo_url,
        conferences(
          id,
          name,
          color
        )
      ),
      away_team:teams!away_team_id(
        id,
        name,
        logo_url,
        conferences(
          id,
          name,
          color
        )
      )
    `)
    .eq("status", "completed")
    .gte("match_date", startDate.toISOString())
    .lte("match_date", endDate.toISOString())

  // Get transfer activity
  const { data: transfers, error: transfersError } = await supabase
    .from("player_transfers")
    .select(`
      id,
      player_id,
      from_team_id,
      to_team_id,
      transfer_amount,
      transfer_date,
      player:players(
        id,
        name,
        position
      ),
      from_team:teams!from_team_id(
        id,
        name,
        logo_url
      ),
      to_team:teams!to_team_id(
        id,
        name,
        logo_url
      )
    `)
    .gte("transfer_date", startDate.toISOString())
    .lte("transfer_date", endDate.toISOString())

  // Get signings
  const { data: signings, error: signingsError } = await supabase
    .from("player_signings")
    .select(`
      id,
      player_id,
      team_id,
      signing_amount,
      created_at,
      player:players(
        id,
        name,
        position
      ),
      team:teams(
        id,
        name,
        logo_url
      )
    `)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  return {
    date: startDate.toISOString().split('T')[0],
    matches: matches || [],
    transfers: transfers || [],
    signings: signings || [],
    summary: {
      totalMatches: matches?.length || 0,
      totalTransfers: transfers?.length || 0,
      totalSignings: signings?.length || 0,
      totalGoals: matches?.reduce((sum, match) => sum + (match.home_score || 0) + (match.away_score || 0), 0) || 0
    }
  }
}

async function getTransferRecap(supabase: any, startDate: Date, endDate: Date) {
  // Get transfer offers
  const { data: offers, error: offersError } = await supabase
    .from("player_transfer_offers")
    .select(`
      id,
      player_id,
      from_team_id,
      to_team_id,
      offer_amount,
      status,
      created_at,
      player:players(
        id,
        name,
        position,
        overall_rating
      ),
      from_team:teams!from_team_id(
        id,
        name,
        logo_url
      ),
      to_team:teams!to_team_id(
        id,
        name,
        logo_url
      )
    `)
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())

  // Get completed transfers
  const { data: transfers, error: transfersError } = await supabase
    .from("player_transfers")
    .select(`
      id,
      player_id,
      from_team_id,
      to_team_id,
      transfer_amount,
      transfer_date,
      player:players(
        id,
        name,
        position,
        overall_rating
      ),
      from_team:teams!from_team_id(
        id,
        name,
        logo_url
      ),
      to_team:teams!to_team_id(
        id,
        name,
        logo_url
      )
    `)
    .gte("transfer_date", startDate.toISOString())
    .lte("transfer_date", endDate.toISOString())

  return {
    date: startDate.toISOString().split('T')[0],
    offers: offers || [],
    transfers: transfers || [],
    summary: {
      totalOffers: offers?.length || 0,
      totalTransfers: transfers?.length || 0,
      totalValue: transfers?.reduce((sum, transfer) => sum + (transfer.transfer_amount || 0), 0) || 0
    }
  }
}

async function getMatchRecap(supabase: any, startDate: Date, endDate: Date) {
  // Get completed matches
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status,
      match_date,
      venue,
      attendance,
      home_team:teams!home_team_id(
        id,
        name,
        logo_url,
        conferences(
          id,
          name,
          color
        )
      ),
      away_team:teams!away_team_id(
        id,
        name,
        logo_url,
        conferences(
          id,
          name,
          color
        )
      )
    `)
    .eq("status", "completed")
    .gte("match_date", startDate.toISOString())
    .lte("match_date", endDate.toISOString())

  return {
    date: startDate.toISOString().split('T')[0],
    matches: matches || [],
    summary: {
      totalMatches: matches?.length || 0,
      totalGoals: matches?.reduce((sum, match) => sum + (match.home_score || 0) + (match.away_score || 0), 0) || 0,
      totalAttendance: matches?.reduce((sum, match) => sum + (match.attendance || 0), 0) || 0
    }
  }
}
