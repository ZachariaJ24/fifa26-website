import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "posts" // posts, replies, votes
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    if (type === "posts") {
      let query = supabase
        .from("forum_posts")
        .select(`
          id,
          title,
          content,
          category,
          author_id,
          created_at,
          updated_at,
          vote_count,
          reply_count,
          is_pinned,
          is_locked,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `)

      if (category) {
        query = query.eq("category", category)
      }

      const { data: posts, error } = await query
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(posts)
    }

    if (type === "replies") {
      const post_id = searchParams.get("post_id")
      
      if (!post_id) {
        return NextResponse.json({ error: "post_id is required for replies" }, { status: 400 })
      }

      const { data: replies, error } = await supabase
        .from("forum_replies")
        .select(`
          id,
          content,
          post_id,
          author_id,
          created_at,
          updated_at,
          vote_count,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `)
        .eq("post_id", post_id)
        .order("created_at", { ascending: true })
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(replies)
    }

    if (type === "votes") {
      const { data: votes, error } = await supabase
        .from("forum_votes")
        .select(`
          id,
          post_id,
          reply_id,
          user_id,
          vote_type,
          created_at
        `)
        .range(offset, offset + limit - 1)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(votes)
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Error fetching forum data:", error)
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
    const { type, title, content, category, post_id, vote_type } = body

    if (type === "post") {
      // Create new forum post
      if (!title || !content || !category) {
        return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 })
      }

      const { data: post, error } = await supabase
        .from("forum_posts")
        .insert({
          title,
          content,
          category,
          author_id: user.id
        })
        .select(`
          id,
          title,
          content,
          category,
          author_id,
          created_at,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(post, { status: 201 })
    }

    if (type === "reply") {
      // Create new reply
      if (!content || !post_id) {
        return NextResponse.json({ error: "Content and post_id are required" }, { status: 400 })
      }

      const { data: reply, error } = await supabase
        .from("forum_replies")
        .insert({
          content,
          post_id,
          author_id: user.id
        })
        .select(`
          id,
          content,
          post_id,
          author_id,
          created_at,
          author:profiles(
            id,
            username,
            avatar_url
          )
        `)
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update reply count on post
      await supabase
        .from("forum_posts")
        .update({ 
          reply_count: supabase.raw("reply_count + 1"),
          updated_at: new Date().toISOString()
        })
        .eq("id", post_id)

      return NextResponse.json(reply, { status: 201 })
    }

    if (type === "vote") {
      // Create or update vote
      if (!vote_type || (!post_id && !reply_id)) {
        return NextResponse.json({ error: "vote_type and either post_id or reply_id are required" }, { status: 400 })
      }

      const { data: existingVote, error: existingError } = await supabase
        .from("forum_votes")
        .select("id, vote_type")
        .eq("user_id", user.id)
        .eq(post_id ? "post_id" : "reply_id", post_id || reply_id)
        .single()

      if (existingVote) {
        // Update existing vote
        const { data: vote, error } = await supabase
          .from("forum_votes")
          .update({ vote_type })
          .eq("id", existingVote.id)
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(vote)
      } else {
        // Create new vote
        const { data: vote, error } = await supabase
          .from("forum_votes")
          .insert({
            post_id: post_id || null,
            reply_id: reply_id || null,
            user_id: user.id,
            vote_type
          })
          .select()
          .single()

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Update vote count
        const table = post_id ? "forum_posts" : "forum_replies"
        const id = post_id || reply_id
        
        await supabase
          .from(table)
          .update({ 
            vote_count: supabase.raw("vote_count + 1")
          })
          .eq("id", id)

        return NextResponse.json(vote, { status: 201 })
      }
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 })
  } catch (error: any) {
    console.error("Error creating forum content:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
