// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayStr = today.toISOString().split('T')[0]
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    // Get today's completed matches
    const { data: completedMatches, error: completedMatchesError } = await supabase
      .from('matches')
      .select(`*,
        home_team:teams!home_team_id(id, name, logo_url),
        away_team:teams!away_team_id(id, name, logo_url)
      `)
      .eq('status', 'Completed')
      .gte('match_date', `${todayStr}T00:00:00.000Z`)
      .lte('match_date', `${todayStr}T23:59:59.999Z`)

    if (completedMatchesError) throw new Error(completedMatchesError.message)

    // Get today's new transfer listings
    const { data: newTransfers, error: newTransfersError } = await supabase
      .from('transfer_listings')
      .select(`*,
        players (*, teams (*)),
        teams (*)
      `)
      .gte('listing_date', `${todayStr}T00:00:00.000Z`)
      .lte('listing_date', `${todayStr}T23:59:59.999Z`)

    if (newTransfersError) throw new Error(newTransfersError.message)

    // Get tomorrow's scheduled matches
    const { data: upcomingMatches, error: upcomingMatchesError } = await supabase
      .from('matches')
      .select(`*,
        home_team:teams!home_team_id(id, name, logo_url),
        away_team:teams!away_team_id(id, name, logo_url)
      `)
      .eq('status', 'Scheduled')
      .gte('match_date', `${tomorrowStr}T00:00:00.000Z`)
      .lte('match_date', `${tomorrowStr}T23:59:59.999Z`)

    if (upcomingMatchesError) throw new Error(upcomingMatchesError.message)

    return NextResponse.json({
      completedMatches,
      newTransfers,
      upcomingMatches,
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
