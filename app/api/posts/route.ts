// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// Get all posts for a thread
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  const threadId = searchParams.get('thread_id')

  if (!threadId) {
    return NextResponse.json({ error: 'thread_id is required' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        users ( id, gamer_tag_id )
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)

    return NextResponse.json({ posts: data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Create a new post
export async function POST(request: Request) {
    const supabase = createRouteHandlerClient({ cookies })
    const { thread_id, user_id, content } = await request.json()

    try {
        const { data, error } = await supabase
            .from('posts')
            .insert({ thread_id, user_id, content })
            .select()

        if (error) throw new Error(error.message)

        return NextResponse.json({ post: data })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
