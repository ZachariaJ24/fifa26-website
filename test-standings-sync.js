// Simple test to verify standings synchronization across the site
// This can be run in the browser console to test consistency

async function testStandingsSync() {
  console.log("🧪 Testing Standings Synchronization...")
  
  try {
    // Import the unified calculator
    const { calculateUnifiedStandingsClient } = await import("./lib/standings-calculator-unified.ts")
    
    // Get Supabase client (assuming it's available globally)
    const supabase = window.supabase || createClient()
    
    // Calculate standings
    const { standings, standingsByConference } = await calculateUnifiedStandingsClient(supabase)
    
    console.log("✅ Standings calculated successfully")
    console.log(`📊 Total teams: ${standings.length}`)
    console.log(`🏆 Conferences: ${Object.keys(standingsByConference).length}`)
    
    // Log sample data
    console.log("📋 Sample standings:", standings.slice(0, 3))
    console.log("🏆 Conference breakdown:", Object.keys(standingsByConference))
    
    // Verify data consistency
    const totalTeamsInConferences = Object.values(standingsByConference)
      .reduce((sum, conf) => sum + conf.teams.length, 0)
    
    if (totalTeamsInConferences === standings.length) {
      console.log("✅ Team count consistency verified")
    } else {
      console.error("❌ Team count mismatch:", totalTeamsInConferences, "vs", standings.length)
    }
    
    // Check for required fields
    const requiredFields = ['id', 'name', 'wins', 'losses', 'otl', 'points', 'conference']
    const missingFields = requiredFields.filter(field => 
      standings.some(team => team[field] === undefined)
    )
    
    if (missingFields.length === 0) {
      console.log("✅ All required fields present")
    } else {
      console.error("❌ Missing fields:", missingFields)
    }
    
    console.log("🎉 Standings sync test completed!")
    
  } catch (error) {
    console.error("❌ Test failed:", error)
  }
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testStandingsSync = testStandingsSync
}

console.log("Standings sync test loaded. Run testStandingsSync() in console to test.")
