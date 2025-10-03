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

    // Get all season registrations with user data
    const { data: registrations, error: regError } = await supabase
      .from("season_registrations")
      .select(`
        *,
        users (
          id,
          email,
          gamer_tag,
          gamer_tag_id,
          discord_username,
          discord_id,
          primary_position,
          secondary_position,
          console,
          is_banned,
          created_at,
          email_confirmed_at
        ),
        seasons (
          id,
          name,
          season_number,
          is_active
        )
      `)
      .order("created_at", { ascending: false })

    if (regError) {
      console.error("Error fetching season registrations:", regError)
      return NextResponse.json({ error: "Failed to fetch season registrations" }, { status: 500 })
    }

    // Get all users for comparison
    const { data: allUsers, error: usersError } = await supabase
      .from("users")
      .select(`
        id,
        email,
        gamer_tag,
        gamer_tag_id,
        discord_username,
        discord_id,
        primary_position,
        secondary_position,
        console,
        is_banned,
        created_at,
        email_confirmed_at
      `)

    if (usersError) {
      console.error("Error fetching users:", usersError)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // Analyze registrations
    const analysis = {
      totalRegistrations: registrations?.length || 0,
      totalUsers: allUsers?.length || 0,
      registrationRate: 0,
      statusBreakdown: {
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0
      },
      positionBreakdown: {} as Record<string, number>,
      consoleBreakdown: {} as Record<string, number>,
      seasonBreakdown: {} as Record<string, number>,
      issues: [] as any[],
      duplicateRegistrations: [] as any[],
      invalidRegistrations: [] as any[],
      bannedUserRegistrations: [] as any[],
      unconfirmedUserRegistrations: [] as any[]
    }

    // Calculate registration rate
    if (allUsers && allUsers.length > 0) {
      analysis.registrationRate = ((registrations?.length || 0) / allUsers.length) * 100
    }

    // Process each registration
    const userRegistrationMap = new Map<string, any[]>()

    registrations?.forEach(reg => {
      // Status breakdown
      const status = reg.status?.toLowerCase() || 'unknown'
      if (analysis.statusBreakdown.hasOwnProperty(status)) {
        analysis.statusBreakdown[status]++
      }

      // Position breakdown
      if (reg.primary_position) {
        analysis.positionBreakdown[reg.primary_position] = 
          (analysis.positionBreakdown[reg.primary_position] || 0) + 1
      }

      // Console breakdown
      if (reg.console) {
        analysis.consoleBreakdown[reg.console] = 
          (analysis.consoleBreakdown[reg.console] || 0) + 1
      }

      // Season breakdown
      const seasonName = reg.seasons?.name || `Season ${reg.seasons?.season_number || 'Unknown'}`
      analysis.seasonBreakdown[seasonName] = 
        (analysis.seasonBreakdown[seasonName] || 0) + 1

      // Track user registrations for duplicate detection
      if (reg.user_id) {
        if (!userRegistrationMap.has(reg.user_id)) {
          userRegistrationMap.set(reg.user_id, [])
        }
        userRegistrationMap.get(reg.user_id)!.push(reg)
      }

      // Check for issues
      if (reg.users) {
        // Banned user registrations
        if (reg.users.is_banned) {
          analysis.bannedUserRegistrations.push({
            registrationId: reg.id,
            userId: reg.user_id,
            userEmail: reg.users.email,
            gamerTag: reg.users.gamer_tag,
            status: reg.status,
            seasonName: reg.seasons?.name,
            registeredAt: reg.created_at
          })
        }

        // Unconfirmed user registrations
        if (!reg.users.email_confirmed_at) {
          analysis.unconfirmedUserRegistrations.push({
            registrationId: reg.id,
            userId: reg.user_id,
            userEmail: reg.users.email,
            gamerTag: reg.users.gamer_tag,
            status: reg.status,
            seasonName: reg.seasons?.name,
            registeredAt: reg.created_at,
            userCreatedAt: reg.users.created_at
          })
        }

        // Invalid registrations (missing required data)
        const invalidFields = []
        if (!reg.primary_position) invalidFields.push('primary_position')
        if (!reg.gamer_tag) invalidFields.push('gamer_tag')
        if (!reg.console) invalidFields.push('console')

        if (invalidFields.length > 0) {
          analysis.invalidRegistrations.push({
            registrationId: reg.id,
            userId: reg.user_id,
            userEmail: reg.users.email,
            gamerTag: reg.users.gamer_tag,
            status: reg.status,
            seasonName: reg.seasons?.name,
            missingFields: invalidFields,
            registeredAt: reg.created_at
          })
        }
      }
    })

    // Find duplicate registrations (same user, same season)
    userRegistrationMap.forEach((userRegs, userId) => {
      const seasonGroups = new Map<string, any[]>()
      
      userRegs.forEach(reg => {
        const seasonKey = `${reg.season_id}-${reg.season_number}`
        if (!seasonGroups.has(seasonKey)) {
          seasonGroups.set(seasonKey, [])
        }
        seasonGroups.get(seasonKey)!.push(reg)
      })

      seasonGroups.forEach((regs, seasonKey) => {
        if (regs.length > 1) {
          analysis.duplicateRegistrations.push({
            userId,
            userEmail: regs[0].users?.email,
            gamerTag: regs[0].users?.gamer_tag,
            seasonName: regs[0].seasons?.name,
            seasonNumber: regs[0].season_number,
            duplicateCount: regs.length,
            registrations: regs.map(r => ({
              id: r.id,
              status: r.status,
              createdAt: r.created_at,
              primaryPosition: r.primary_position,
              console: r.console
            }))
          })
        }
      })
    })

    // Find users who should have registered but haven't
    const registeredUserIds = new Set(registrations?.map(r => r.user_id) || [])
    const unregisteredUsers = allUsers?.filter(user => 
      !user.is_banned && 
      user.email_confirmed_at && 
      !registeredUserIds.has(user.id)
    ) || []

    // Generate summary issues
    if (analysis.bannedUserRegistrations.length > 0) {
      analysis.issues.push({
        type: "banned_users_registered",
        severity: "high",
        count: analysis.bannedUserRegistrations.length,
        message: `${analysis.bannedUserRegistrations.length} banned users have season registrations`
      })
    }

    if (analysis.duplicateRegistrations.length > 0) {
      analysis.issues.push({
        type: "duplicate_registrations",
        severity: "medium",
        count: analysis.duplicateRegistrations.length,
        message: `${analysis.duplicateRegistrations.length} users have duplicate registrations for the same season`
      })
    }

    if (analysis.invalidRegistrations.length > 0) {
      analysis.issues.push({
        type: "invalid_registrations",
        severity: "medium",
        count: analysis.invalidRegistrations.length,
        message: `${analysis.invalidRegistrations.length} registrations are missing required data`
      })
    }

    if (analysis.unconfirmedUserRegistrations.length > 0) {
      analysis.issues.push({
        type: "unconfirmed_users_registered",
        severity: "low",
        count: analysis.unconfirmedUserRegistrations.length,
        message: `${analysis.unconfirmedUserRegistrations.length} unconfirmed users have registrations`
      })
    }

    if (unregisteredUsers.length > 0) {
      analysis.issues.push({
        type: "eligible_unregistered",
        severity: "info",
        count: unregisteredUsers.length,
        message: `${unregisteredUsers.length} eligible users have not registered for any season`
      })
    }

    return NextResponse.json({
      analysis,
      unregisteredUsers: unregisteredUsers.map(user => ({
        id: user.id,
        email: user.email,
        gamerTag: user.gamer_tag,
        discordUsername: user.discord_username,
        primaryPosition: user.primary_position,
        console: user.console,
        createdAt: user.created_at,
        lastSignIn: user.email_confirmed_at
      })),
      recommendations: [
        ...(analysis.bannedUserRegistrations.length > 0 ? [{
          type: "cleanup",
          priority: "high",
          action: "Remove registrations from banned users",
          count: analysis.bannedUserRegistrations.length
        }] : []),
        ...(analysis.duplicateRegistrations.length > 0 ? [{
          type: "cleanup",
          priority: "medium",
          action: "Resolve duplicate registrations",
          count: analysis.duplicateRegistrations.length
        }] : []),
        ...(analysis.invalidRegistrations.length > 0 ? [{
          type: "cleanup",
          priority: "medium",
          action: "Fix invalid registrations",
          count: analysis.invalidRegistrations.length
        }] : []),
        ...(unregisteredUsers.length > 0 ? [{
          type: "outreach",
          priority: "low",
          action: "Contact eligible unregistered users",
          count: unregisteredUsers.length
        }] : [])
      ]
    })

  } catch (error: any) {
    console.error("Error in season-registration-diagnostics API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
