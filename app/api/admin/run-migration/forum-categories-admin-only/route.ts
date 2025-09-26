import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userRoles } = await supabase.from("user_roles").select("role").eq("user_id", user.id)

    const isAdmin = userRoles?.some((ur) => ur.role === "Admin") || false

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Update existing categories to admin-only for announcement-like types
    const { error: updateError } = await supabase
      .from("forum_categories")
      .update({ admin_only: true })
      .or("name.ilike.%announcement%,name.ilike.%admin%,name.ilike.%news%")

    if (updateError) {
      console.error("Migration update error:", updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Ensure a General Discussion category exists and is not admin-only
    const { error: upsertError } = await supabase
      .from("forum_categories")
      .upsert(
        {
          name: "General Discussion",
          description: "General discussion topics",
          color: "#6366f1",
          admin_only: false,
        },
        { onConflict: "name" }
      )

    if (upsertError) {
      console.error("Migration upsert error:", upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Forum categories admin-only migration completed" })
  } catch (error) {
    console.error("Error running migration:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
