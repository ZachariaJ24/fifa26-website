import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    const { name, division, logo_url, is_active } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 })
    }

    // Update team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .update({
        name,
        division: division || null,
        logo_url: logo_url || null,
        is_active: is_active !== false,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single()

    if (teamError) {
      console.error("Error updating team:", teamError)
      return NextResponse.json({ error: "Failed to update team" }, { status: 500 })
    }

    return NextResponse.json(team)
  } catch (error: any) {
    console.error("Error in /api/admin/teams/[id] PUT:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is an admin
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (roleError || !userRole) {
      return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 })
    }

    // Check if team has players
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select("id")
      .eq("team_id", params.id)
      .limit(1)

    if (playersError) {
      console.error("Error checking players:", playersError)
      return NextResponse.json({ error: "Failed to check team players" }, { status: 500 })
    }

    if (players && players.length > 0) {
      return NextResponse.json({ error: "Cannot delete team with players" }, { status: 400 })
    }

    // Delete team
    const { error: deleteError } = await supabase
      .from("teams")
      .delete()
      .eq("id", params.id)

    if (deleteError) {
      console.error("Error deleting team:", deleteError)
      return NextResponse.json({ error: "Failed to delete team" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/admin/teams/[id] DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
