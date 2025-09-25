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

    const { name, tier, color, description } = await request.json()

    if (!name || !tier || !color) {
      return NextResponse.json({ error: "Name, tier, and color are required" }, { status: 400 })
    }

    // Update division
    const { data: division, error: divisionError } = await supabase
      .from("divisions")
      .update({
        name,
        tier,
        color,
        description: description || null,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single()

    if (divisionError) {
      console.error("Error updating division:", divisionError)
      return NextResponse.json({ error: "Failed to update division" }, { status: 500 })
    }

    return NextResponse.json(division)
  } catch (error: any) {
    console.error("Error in /api/admin/divisions/[id] PUT:", error)
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

    // Check if division has teams
    const { data: teams, error: teamsError } = await supabase
      .from("teams")
      .select("id")
      .eq("division", (await supabase.from("divisions").select("name").eq("id", params.id).single()).data?.name)
      .limit(1)

    if (teamsError) {
      console.error("Error checking teams:", teamsError)
      return NextResponse.json({ error: "Failed to check teams" }, { status: 500 })
    }

    if (teams && teams.length > 0) {
      return NextResponse.json({ error: "Cannot delete division with teams" }, { status: 400 })
    }

    // Delete division
    const { error: deleteError } = await supabase
      .from("divisions")
      .delete()
      .eq("id", params.id)

    if (deleteError) {
      console.error("Error deleting division:", deleteError)
      return NextResponse.json({ error: "Failed to delete division" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/admin/divisions/[id] DELETE:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
