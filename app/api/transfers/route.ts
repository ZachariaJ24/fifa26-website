// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all transfer listings
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('transfer_listings')
      .select(`
        *,
        players (*, teams (*)),
        teams (*)
      `)
      .eq('status', 'active')
      .order('listing_date', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ listings: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create a new transfer listing
export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { player_id, team_id, asking_price } = await request.json()

  try {
    const { data, error } = await supabase
      .from('transfer_listings')
      .insert({ player_id, team_id, asking_price })
      .select()

    if (error) throw new Error(error.message)

    return NextResponse.json({ listing: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}