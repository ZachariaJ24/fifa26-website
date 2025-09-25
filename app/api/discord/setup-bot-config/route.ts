import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Delete any existing config to ensure we have only one
    await supabase.from("discord_bot_config").delete().neq("id", "00000000-0000-0000-0000-000000000000")

    // Insert the correct configuration using environment variables
    const { data, error } = await supabase.from("discord_bot_config").insert({
      guild_id: process.env.DISCORD_GUILD_ID || "1420630992757985333",
      bot_token: process.env.DISCORD_BOT_TOKEN || "",
      registered_role_id: process.env.DISCORD_REGISTERED_ROLE_ID || "1420812444649132116",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error setting up bot config:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Bot configuration set up successfully",
      data,
    })
  } catch (error: any) {
    console.error("Error setting up bot config:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
