import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const clubId = params.id

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // Fetch specific club with conference information
    const { data: club, error } = await supabase
      .from("clubs")
      .select(`
        *,
        conference:conferences(id, name, color)
      `)
      .eq("id", clubId)
      .single()

    if (error) {
      console.error("Error fetching club:", error)
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    return NextResponse.json(club)
  } catch (error: any) {
    console.error("Error in get club API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const clubId = params.id

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      short_name,
      logo_url,
      description,
      founded_year,
      home_stadium,
      website,
      social_media,
      contact_info,
      conference_id,
      division,
      is_active,
      availability
    } = body

    if (!name) {
      return NextResponse.json({ error: "Club name is required" }, { status: 400 })
    }

    // Update club
    const { data: club, error } = await supabase
      .from("clubs")
      .update({
        name,
        short_name: short_name || null,
        logo_url: logo_url || null,
        description: description || null,
        founded_year: founded_year || null,
        home_stadium: home_stadium || null,
        website: website || null,
        social_media: social_media || {},
        contact_info: contact_info || {},
        conference_id: conference_id || null,
        division: division || "Premier Division",
        is_active: is_active !== undefined ? is_active : true,
        availability: availability || {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: true,
          sunday: false,
          preferred_times: ["20:30", "21:10", "21:50"],
          timezone: "EST"
        },
        updated_at: new Date().toISOString()
      })
      .eq("id", clubId)
      .select(`
        *,
        conference:conferences(id, name, color)
      `)
      .single()

    if (error) {
      console.error("Error updating club:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(club)
  } catch (error: any) {
    console.error("Error in update club API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient()
    const clubId = params.id

    // Verify admin permissions
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)

    const isAdmin = adminRoles?.some(role => role.role === "Admin")
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin privileges required" }, { status: 403 })
    }

    // Check if club has any dependencies (players, games, etc.)
    const { data: players } = await supabase
      .from("users")
      .select("id")
      .eq("team_id", clubId)
      .limit(1)

    if (players && players.length > 0) {
      return NextResponse.json({ 
        error: "Cannot delete club with assigned players. Please reassign players first." 
      }, { status: 400 })
    }

    // Delete club
    const { error } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId)

    if (error) {
      console.error("Error deleting club:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Club deleted successfully" })
  } catch (error: any) {
    console.error("Error in delete club API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
