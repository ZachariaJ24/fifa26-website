import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get divisions directly - no auth check for now
    const { data: divisions, error } = await supabase
      .from("divisions")
      .select("*")
      .order("tier")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    return NextResponse.json(divisions || [])
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { name, tier, color, description } = body

    // Create division directly
    const { data: division, error } = await supabase
      .from("divisions")
      .insert({ name, tier, color, description })
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Database error", details: error.message }, { status: 500 })
    }

    return NextResponse.json(division)
  } catch (error: any) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
