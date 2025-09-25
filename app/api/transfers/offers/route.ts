import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { playerId, teamId, offerAmount } = await request.json()

    if (!playerId || !teamId || !offerAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the current transfer offer duration from system settings
    const { data: durationSetting, error: durationError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "transfer_offer_duration")
      .single()

    // Default to 14400 seconds (4 hours) if setting not found
    const offerDurationSeconds = durationSetting?.value || 14400

    // Set expiration time based on system setting
    const expirationTime = new Date(Date.now() + offerDurationSeconds * 1000).toISOString()

    const { data, error } = await supabase
      .from("player_transfer_offers")
      .insert({
        player_id: playerId,
        team_id: teamId,
        offer_amount: offerAmount,
        offer_expires_at: expirationTime,
        status: 'active'
      })
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    const teamId = searchParams.get('teamId')

    let query = supabase
      .from("player_transfer_offers")
      .select(`
        *,
        player:player_id(
          id,
          users:user_id(gamer_tag_id, email)
        ),
        team:team_id(
          id,
          name,
          logo_url
        )
      `)
      .eq("status", "active")

    if (playerId) {
      query = query.eq("player_id", playerId)
    }

    if (teamId) {
      query = query.eq("team_id", teamId)
    }

    const { data, error } = await query.order("offer_amount", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
