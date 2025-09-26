import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const supabase = createAdminClient()

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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const clubId = formData.get("club_id") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!clubId) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 5MB." 
      }, { status: 400 })
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `club-${clubId}-${Date.now()}.${fileExt}`
    const filePath = `club-logos/${fileName}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("club-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      return NextResponse.json({ 
        error: "Failed to upload file" 
      }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("club-assets")
      .getPublicUrl(filePath)

    const logoUrl = urlData.publicUrl

    // Update club with new logo URL
    const { data: club, error: updateError } = await supabase
      .from("clubs")
      .update({
        logo_url: logoUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", clubId)
      .select(`
        id,
        name,
        logo_url
      `)
      .single()

    if (updateError) {
      console.error("Error updating club logo:", updateError)
      // Try to delete the uploaded file
      await supabase.storage
        .from("club-assets")
        .remove([filePath])
      
      return NextResponse.json({ 
        error: "Failed to update club logo" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      logo_url: logoUrl,
      club: club
    })
  } catch (error: any) {
    console.error("Error in upload club logo API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createAdminClient()

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

    const { club_id } = await request.json()

    if (!club_id) {
      return NextResponse.json({ error: "Club ID is required" }, { status: 400 })
    }

    // Get current club logo URL
    const { data: club, error: fetchError } = await supabase
      .from("clubs")
      .select("logo_url")
      .eq("id", club_id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 })
    }

    if (!club.logo_url) {
      return NextResponse.json({ error: "No logo to delete" }, { status: 400 })
    }

    // Extract file path from URL
    const url = new URL(club.logo_url)
    const filePath = url.pathname.split('/').slice(-2).join('/') // Get last two parts of path

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from("club-assets")
      .remove([filePath])

    if (deleteError) {
      console.error("Error deleting file from storage:", deleteError)
      // Continue with database update even if storage deletion fails
    }

    // Update club to remove logo URL
    const { error: updateError } = await supabase
      .from("clubs")
      .update({
        logo_url: null,
        updated_at: new Date().toISOString()
      })
      .eq("id", club_id)

    if (updateError) {
      console.error("Error updating club:", updateError)
      return NextResponse.json({ 
        error: "Failed to remove logo from club" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Logo deleted successfully"
    })
  } catch (error: any) {
    console.error("Error in delete club logo API:", error)
    return NextResponse.json({
      error: "Internal server error",
      details: error.message
    }, { status: 500 })
  }
}
