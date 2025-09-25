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
    const { playerId, teamId, salary, contractLength } = await request.json()

    if (!playerId || !teamId || !salary) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if signing is enabled
    const { data: signingSettings, error: settingsError } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "signings_enabled")
      .single()

    if (settingsError) {
      console.error("Error checking signing status:", settingsError)
    }

    if (signingSettings && signingSettings.value !== true) {
      return NextResponse.json({ error: "Signings are currently disabled by league administrators" }, { status: 403 })
    }

    // Create signing record
    const { data, error } = await supabase
      .from("player_signings")
      .insert({
        player_id: playerId,
        team_id: teamId,
        salary: salary,
        contract_length: contractLength || 1,
        status: 'pending',
        signed_at: new Date().toISOString()
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
    const status = searchParams.get('status')

    let query = supabase
      .from("player_signings")
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

    if (playerId) {
      query = query.eq("player_id", playerId)
    }

    if (teamId) {
      query = query.eq("team_id", teamId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("signed_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
