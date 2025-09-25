import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check if user is authenticated and is an admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")

    if (rolesError || !userRoles || userRoles.length === 0) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
    }

    const { seasonId } = await request.json()

    if (!seasonId) {
      return NextResponse.json({ error: "Season ID is required" }, { status: 400 })
    }

    console.log(`Starting comprehensive stats sync for season ${seasonId}`)

    // Import sync functions
    const { updateTeamStatistics } = await import("../../../../lib/standings-calculator")
    const { syncEaStatsToPlayerStatistics } = await import("../../../../lib/sync-ea-stats-to-player-statistics")
    const { syncAllTeamStats } = await import("../../../../lib/team-stats-calculator")

    const results = {
      teamStats: { success: false, message: "" },
      playerStats: { success: false, message: "" },
      standings: { success: false, message: "" }
    }

    try {
      // 1. Sync all team stats
      console.log("Syncing team statistics...")
      const teamStatsResult = await syncAllTeamStats(seasonId)
      results.teamStats = { 
        success: teamStatsResult, 
        message: teamStatsResult ? "Team stats synced successfully" : "Failed to sync team stats" 
      }
    } catch (error: any) {
      console.error("Error syncing team stats:", error)
      results.teamStats = { success: false, message: error.message }
    }

    try {
      // 2. Sync player statistics from EA data
      console.log("Syncing player statistics...")
      const playerStatsResult = await syncEaStatsToPlayerStatistics()
      results.playerStats = { 
        success: playerStatsResult.success, 
        message: playerStatsResult.message 
      }
    } catch (error: any) {
      console.error("Error syncing player stats:", error)
      results.playerStats = { success: false, message: error.message }
    }

    try {
      // 3. Update standings
      console.log("Updating standings...")
      const standingsResult = await updateTeamStatistics(seasonId)
      results.standings = { 
        success: standingsResult, 
        message: standingsResult ? "Standings updated successfully" : "Failed to update standings" 
      }
    } catch (error: any) {
      console.error("Error updating standings:", error)
      results.standings = { success: false, message: error.message }
    }

    const allSuccessful = results.teamStats.success && results.playerStats.success && results.standings.success

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful ? "All statistics synced successfully" : "Some statistics failed to sync",
      results,
      seasonId
    })

  } catch (error: any) {
    console.error("Error in sync-all-stats:", error)
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 })
  }
}
