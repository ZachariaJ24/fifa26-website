import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { offerAmount } = await request.json()
    const offerId = params.id

    if (!offerId || !offerAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get the current transfer offer duration from system settings
    const { data: durationSetting } = await supabase
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
      .update({
        offer_amount: offerAmount,
        offer_expires_at: expirationTime,
      })
      .eq("id", offerId)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const offerId = params.id

    if (!offerId) {
      return NextResponse.json({ error: "Missing offer ID" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("player_transfer_offers")
      .update({ status: 'cancelled' })
      .eq("id", offerId)
      .select()

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
