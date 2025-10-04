import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("Unban API called") // Debug log

    const body = await request.json()
    console.log("Request body:", body) // Debug log

    const { userId } = body

    if (!userId) {
      console.log("Missing userId in request")
      return NextResponse.json({ error: "Missing required field: userId" }, { status: 400 })
    }

    console.log("Unbanning user:", userId)

    // Update users table to unban (new schema)
    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({
        is_banned: false,
        ban_reason: null,
        ban_expiration: null
      })
      .eq("id", userId)

    if (updateError) {
      console.error("Error unbanning user:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "User unbanned successfully",
      user: { id: userId },
    })
  } catch (error: any) {
    console.error("Unexpected error during unban:", error)
    return NextResponse.json({ error: error.message || "An unexpected error occurred" }, { status: 500 })
  }
}
