// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all threads for a forum
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const forumId = searchParams.get('forum_id')

  if (!forumId) {
    return NextResponse.json({ error: 'forum_id is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('threads')
      .select(`
        *,
        users ( id, gamer_tag_id )
      `)
      .eq('forum_id', forumId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    return NextResponse.json({ threads: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create a new thread
export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { forum_id, user_id, title } = await request.json()

    try {
        const { data, error } = await supabase
            .from('threads')
            .insert({ forum_id, user_id, title })
            .select()

        if (error) throw new Error(error.message)

        return NextResponse.json({ thread: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
