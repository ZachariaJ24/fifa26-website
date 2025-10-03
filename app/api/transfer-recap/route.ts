// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all completed transfers
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('transfer_listings')
      .select(`
        *,
        players (*, clubs (*)),
        clubs (*)
      `)
      .eq('status', 'completed')
      .order('listing_date', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ transfers: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
