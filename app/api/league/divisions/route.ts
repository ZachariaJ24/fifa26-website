import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get divisions
    const { data: divisions, error } = await supabase
      .from("divisions")
      .select("*")
      .order("tier")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch divisions" }, { status: 500 })
    }

    return NextResponse.json(divisions || [])
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "Admin")
      .single()

    if (!userRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, tier, color, description } = body

    // Create division
    const { data: division, error } = await supabase
      .from("divisions")
      .insert({ name, tier, color, description })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create division" }, { status: 500 })
    }

    return NextResponse.json(division)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
