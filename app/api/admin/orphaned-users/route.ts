import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const supabase = createAdminClient()

    // Verify admin permissions
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error("Error fetching auth users:", authError)
      return NextResponse.json({ error: "Failed to fetch auth users" }, { status: 500 })
    }

    // Get all public users
    const { data: publicUsers, error: publicError } = await supabase
      .from("users")
      .select("id, email, created_at, email_confirmed_at")
    
    if (publicError) {
      console.error("Error fetching public users:", publicError)
      return NextResponse.json({ error: "Failed to fetch public users" }, { status: 500 })
    }

    const publicUserIds = new Set(publicUsers?.map(user => user.id) || [])
    const authUserIds = new Set(authUsers?.users?.map(user => user.id) || [])

    // Find orphaned auth users (exist in auth but not in public.users)
    const orphanedAuthUsers = authUsers?.users?.filter(authUser => 
      !publicUserIds.has(authUser.id)
    ) || []

    // Find orphaned public users (exist in public.users but not in auth)
    const orphanedPublicUsers = publicUsers?.filter(publicUser => 
      !authUserIds.has(publicUser.id)
    ) || []

    // Find unconfirmed users older than 24 hours
    const unconfirmedUsers = publicUsers?.filter(user => 
      !user.email_confirmed_at && 
      new Date(user.created_at) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    ) || []

    // Find users with no activity for 30+ days
    const inactiveUsers = publicUsers?.filter(user => {
      const lastActivity = user.email_confirmed_at || user.created_at
      return new Date(lastActivity) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }) || []

    return NextResponse.json({
      orphanedAuthUsers: orphanedAuthUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        type: "auth_orphan"
      })),
      orphanedPublicUsers: orphanedPublicUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        type: "public_orphan"
      })),
      unconfirmedUsers: unconfirmedUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        type: "unconfirmed"
      })),
      inactiveUsers: inactiveUsers.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        email_confirmed_at: user.email_confirmed_at,
        type: "inactive"
      })),
      summary: {
        totalAuthUsers: authUsers?.users?.length || 0,
        totalPublicUsers: publicUsers?.length || 0,
        orphanedAuthCount: orphanedAuthUsers.length,
        orphanedPublicCount: orphanedPublicUsers.length,
        unconfirmedCount: unconfirmedUsers.length,
        inactiveCount: inactiveUsers.length
      }
    })

  } catch (error: any) {
    console.error("Error in orphaned-users API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { userIds, type } = await request.json()

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json({ error: "User IDs array is required" }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify admin permissions
    const { data: { user: adminUser } } = await supabase.auth.getUser()
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    const deletionResults = {
      success: [] as string[],
      failed: [] as { id: string, error: string }[]
    }

    for (const userId of userIds) {
      try {
        if (type === "auth_orphan") {
          // Delete from auth.users only
          const { error: authError } = await supabase.auth.admin.deleteUser(userId)
          if (authError) {
            deletionResults.failed.push({ id: userId, error: authError.message })
          } else {
            deletionResults.success.push(userId)
          }
        } else if (type === "public_orphan") {
          // Delete from public.users only
          const { error: publicError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId)
          
          if (publicError) {
            deletionResults.failed.push({ id: userId, error: publicError.message })
          } else {
            deletionResults.success.push(userId)
          }
        } else if (type === "unconfirmed" || type === "inactive") {
          // Delete from both auth and public
          const { error: authError } = await supabase.auth.admin.deleteUser(userId)
          const { error: publicError } = await supabase
            .from("users")
            .delete()
            .eq("id", userId)
          
          if (authError && publicError) {
            deletionResults.failed.push({ 
              id: userId, 
              error: `Auth: ${authError.message}, Public: ${publicError.message}` 
            })
          } else {
            deletionResults.success.push(userId)
          }
        }
      } catch (error: any) {
        deletionResults.failed.push({ id: userId, error: error.message })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${userIds.length} users`,
      results: deletionResults
    })

  } catch (error: any) {
    console.error("Error in orphaned-users cleanup API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
