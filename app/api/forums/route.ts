// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all forums
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data, error } = await supabase
      .from('forums')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ forums: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create a new forum (admin only)
export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { name, description } = await request.json()

    // Add admin check here in a real application

    try {
        const { data, error } = await supabase
            .from('forums')
            .insert({ name, description })
            .select()

        if (error) throw new Error(error.message)

        return NextResponse.json({ forum: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
