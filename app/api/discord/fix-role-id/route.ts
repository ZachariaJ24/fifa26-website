import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    )

    // Update the bot configuration with the correct registered role ID
    const { error } = await supabase.from("discord_bot_config").upsert({
      guild_id: process.env.DISCORD_GUILD_ID || "1420630992757985333",
      bot_token: process.env.DISCORD_BOT_TOKEN || "",
      registered_role_id: process.env.DISCORD_REGISTERED_ROLE_ID || "1420812444649132116",
    })

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: "Bot configuration updated with correct registered role ID",
      registered_role_id: process.env.DISCORD_REGISTERED_ROLE_ID || "1420812444649132116",
    })
  } catch (error: any) {
    console.error("Error updating bot config:", error)
    return NextResponse.json(
      {
        error: error.message,
        details: "Failed to update bot configuration",
      },
      { status: 500 },
    )
  }
}
