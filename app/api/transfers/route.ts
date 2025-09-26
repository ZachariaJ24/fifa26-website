import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "offers" // offers, signings, completed
    const status = searchParams.get("status")
    const team_id = searchParams.get("team_id")

    let query

    if (type === "offers") {
      query = supabase
        .from("player_transfer_offers")
        .select(`
          id,
          player_id,
          from_team_id,
          to_team_id,
          offer_amount,
          status,
          expires_at,
          created_at,
          updated_at,
          player:players(
            id,
            name,
            position,
            overall_rating,
            salary
          ),
          from_team:teams!from_team_id(
            id,
            name,
            logo_url,
            conferences(
              id,
              name,
              color
            )
          ),
          to_team:teams!to_team_id(
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

      if (status) {
        query = query.eq("status", status)
      }

      if (team_id) {
        query = query.or(`from_team_id.eq.${team_id},to_team_id.eq.${team_id}`)
      }

      const { data: offers, error } = await query
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(offers)
    }

    if (type === "signings") {
      query = supabase
        .from("player_signings")
        .select(`
          id,
          player_id,
          team_id,
          signing_amount,
          contract_length,
          status,
          created_at,
          updated_at,
          player:players(
            id,
            name,
            position,
            overall_rating,
            salary
          ),
          team:teams(
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

      if (status) {
        query = query.eq("status", status)
      }

      if (team_id) {
        query = query.eq("team_id", team_id)
      }

      const { data: signings, error } = await query
        .order("created_at", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(signings)
    }

    if (type === "completed") {
      query = supabase
        .from("player_transfers")
        .select(`
          id,
          player_id,
          from_team_id,
          to_team_id,
          transfer_amount,
          transfer_date,
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
            logo_url,
            conferences(
              id,
              name,
              color
            )
          ),
          to_team:teams!to_team_id(
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

      if (team_id) {
        query = query.or(`from_team_id.eq.${team_id},to_team_id.eq.${team_id}`)
      }

      const { data: transfers, error } = await query
        .order("transfer_date", { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(transfers)
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Error fetching transfers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { type, player_id, team_id, amount, contract_length } = body

    if (!type || !player_id || !team_id) {
      return NextResponse.json({ error: "Type, player_id, and team_id are required" }, { status: 400 })
    }

    if (type === "signing") {
      // Create direct signing
      const { data: signing, error } = await supabase
        .from("player_signings")
        .insert({
          player_id,
          team_id,
          signing_amount: amount || 0,
          contract_length: contract_length || 1,
          status: "active"
        })
        .select(`
          id,
          player_id,
          team_id,
          signing_amount,
          contract_length,
          status,
          player:players(
            id,
            name,
            position,
            overall_rating
          ),
          team:teams(
            id,
            name,
            logo_url
          )
        `)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update player's team
      const { error: updateError } = await supabase
        .from("players")
        .update({ team_id })
        .eq("id", player_id)

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 })
      }

      return NextResponse.json(signing, { status: 201 })
    }

    if (type === "offer") {
      // Create transfer offer
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

      const { data: offer, error } = await supabase
        .from("player_transfer_offers")
        .insert({
          player_id,
          from_team_id: body.from_team_id,
          to_team_id: team_id,
          offer_amount: amount || 0,
          status: "pending",
          expires_at: expiresAt.toISOString()
        })
        .select(`
          id,
          player_id,
          from_team_id,
          to_team_id,
          offer_amount,
          status,
          expires_at,
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
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(offer, { status: 201 })
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Error creating transfer:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}