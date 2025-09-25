import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { enabled } = await request.json()

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Insufficient permissions - Admin role required" }, { status: 403 })
    }

    // Update the transfer_market_enabled setting
    const { error } = await supabase
      .from("system_settings")
      .upsert(
        { 
          key: "transfer_market_enabled", 
          value: enabled,
          updated_by: session.user.id,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      )

    if (error) {
      console.error("Database error updating transfer market status", error)
      throw error;
    }

    // Log the action (removed for production)

    return NextResponse.json({
      success: true,
      enabled,
      message: `Transfer market has been ${enabled ? 'enabled' : 'disabled'}`
    })
    
  } catch (error: any) {
    console.error("Error updating transfer market status", error)

    return NextResponse.json(
      {
        error: "Failed to update transfer market status",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Add GET endpoint to check current transfer market status
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "transfer_market_enabled")
      .single()

    return NextResponse.json({
      enabled: setting?.value ?? false
    })
    
  } catch (error) {
    console.error("Error fetching transfer market status:", error)
    return NextResponse.json(
      { error: "Failed to fetch transfer market status" },
      { status: 500 }
    )
  }
}
