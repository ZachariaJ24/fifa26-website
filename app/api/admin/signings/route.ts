import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies, headers } from "next/headers"
import { logger } from "@/lib/logger"

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

    // Update the signings_enabled setting
    const { error } = await supabase
      .from("system_settings")
      .upsert(
        { 
          key: "signings_enabled", 
          value: enabled,
          updated_by: session.user.id,
          updated_at: new Date().toISOString()
        },
        { onConflict: "key" }
      )

    if (error) {
      logger.error("Database error updating signings status", error, {
        userId: session.user.id,
        action: 'update_signings_status',
        ipAddress: headers().get('x-forwarded-for'),
        userAgent: headers().get('user-agent')
      });
      throw error;
    }

    // Log the action
    logger.info(`Signings ${enabled ? 'enabled' : 'disabled'}`, {
      userId: session.user.id,
      action: `signings_${enabled ? 'enabled' : 'disabled'}`,
      ipAddress: headers().get('x-forwarded-for'),
      userAgent: headers().get('user-agent')
    })

    return NextResponse.json({
      success: true,
      enabled,
      message: `Signings have been ${enabled ? 'enabled' : 'disabled'}`
    })
    
  } catch (error: any) {
    logger.error("Error updating signings status", error, {
      userId: session?.user?.id,
      action: 'update_signings_status',
      ipAddress: headers().get('x-forwarded-for'),
      userAgent: headers().get('user-agent')
    });

    return NextResponse.json(
      {
        error: "Failed to update signings status",
        details: error.message,
      },
      { status: 500 }
    )
  }
}

// Add GET endpoint to check current signings status
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    const { data: setting } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "signings_enabled")
      .single()

    return NextResponse.json({
      enabled: setting?.value ?? false
    })
    
  } catch (error) {
    console.error("Error fetching signings status:", error)
    return NextResponse.json(
      { error: "Failed to fetch signings status" },
      { status: 500 }
    )
  }
}
