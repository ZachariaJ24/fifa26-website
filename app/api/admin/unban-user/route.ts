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

    // Delete from public.banned_users to unban
    const { error: deleteError } = await supabaseAdmin
      .from("banned_users")
      .delete()
      .eq("user_id", userId)

    if (deleteError) {
      console.error("Error deleting banned_users row:", deleteError)
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
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
