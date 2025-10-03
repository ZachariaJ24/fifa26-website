import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function DELETE(request: Request) {
  try {
    const { userId, cascade = true } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
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

    // Get user details before deletion for logging
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`Starting user deletion for user: ${userData.email} (${userId})`)

    // Start transaction-like operations
    const deletionResults = {
      user: false,
      auth: false,
      roles: false,
      seasonRegistrations: false,
      teamAssignments: false,
      discordConnections: false,
      playerStats: false,
      tradeHistory: false,
      waiverHistory: false,
      messages: false,
      notifications: false
    }

    try {
      // 1. Delete from public.users table
      const { error: userError } = await supabase
        .from("users")
        .delete()
        .eq("id", userId)

      if (userError) {
        console.error("Error deleting from users table:", userError)
        throw new Error(`Failed to delete user record: ${userError.message}`)
      }
      deletionResults.user = true

      // 2. Delete from auth.users (Supabase Auth)
      const { error: authError } = await supabase.auth.admin.deleteUser(userId)
      if (authError) {
        console.error("Error deleting from auth.users:", authError)
        // Don't throw here as the user might already be deleted from auth
        deletionResults.auth = false
      } else {
        deletionResults.auth = true
      }

      // 3. Delete user roles
      const { error: rolesError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)

      if (rolesError) {
        console.error("Error deleting user roles:", rolesError)
      } else {
        deletionResults.roles = true
      }

      // 4. Delete season registrations
      const { error: seasonRegError } = await supabase
        .from("season_registrations")
        .delete()
        .eq("user_id", userId)

      if (seasonRegError) {
        console.error("Error deleting season registrations:", seasonRegError)
      } else {
        deletionResults.seasonRegistrations = true
      }

      // 5. Remove from teams (set user_id to null or delete team assignments)
      const { error: teamError } = await supabase
        .from("teams")
        .update({ 
          gm_user_id: null,
          agm_user_id: null 
        })
        .or(`gm_user_id.eq.${userId},agm_user_id.eq.${userId}`)

      if (teamError) {
        console.error("Error updating team assignments:", teamError)
      } else {
        deletionResults.teamAssignments = true
      }

      // 6. Delete Discord connections
      const { error: discordError } = await supabase
        .from("discord_users")
        .delete()
        .eq("user_id", userId)

      if (discordError) {
        console.error("Error deleting Discord connections:", discordError)
      } else {
        deletionResults.discordConnections = true
      }

      // 7. Delete player stats
      const { error: statsError } = await supabase
        .from("player_stats")
        .delete()
        .eq("user_id", userId)

      if (statsError) {
        console.error("Error deleting player stats:", statsError)
      } else {
        deletionResults.playerStats = true
      }

      // 8. Delete trade history
      const { error: tradeError } = await supabase
        .from("trades")
        .delete()
        .or(`initiator_user_id.eq.${userId},recipient_user_id.eq.${userId}`)

      if (tradeError) {
        console.error("Error deleting trade history:", tradeError)
      } else {
        deletionResults.tradeHistory = true
      }

      // 9. Delete waiver history
      const { error: waiverError } = await supabase
        .from("waivers")
        .delete()
        .eq("user_id", userId)

      if (waiverError) {
        console.error("Error deleting waiver history:", waiverError)
      } else {
        deletionResults.waiverHistory = true
      }

      // 10. Delete messages/forum posts
      const { error: messagesError } = await supabase
        .from("messages")
        .delete()
        .eq("user_id", userId)

      if (messagesError) {
        console.error("Error deleting messages:", messagesError)
      } else {
        deletionResults.messages = true
      }

      // 11. Delete notifications
      const { error: notificationsError } = await supabase
        .from("notifications")
        .delete()
        .eq("user_id", userId)

      if (notificationsError) {
        console.error("Error deleting notifications:", notificationsError)
      } else {
        deletionResults.notifications = true
      }

      // 12. Delete from banned_users if exists
      const { error: bannedError } = await supabase
        .from("banned_users")
        .delete()
        .eq("user_id", userId)

      if (bannedError) {
        console.error("Error deleting from banned_users:", bannedError)
      }

      console.log(`User deletion completed for ${userData.email}:`, deletionResults)

      return NextResponse.json({
        success: true,
        message: `User ${userData.email} has been completely deleted from the system`,
        deletionResults,
        deletedUser: {
          id: userId,
          email: userData.email,
          gamer_tag: userData.gamer_tag
        }
      })

    } catch (error: any) {
      console.error("Error during user deletion:", error)
      return NextResponse.json({
        error: "Failed to delete user",
        details: error.message,
        partialResults: deletionResults
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error("Error in delete-user API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}