/**
 * Utility function to debug position data from EA API
 */
export function debugPositionData(player: any) {
  return {
    name: player.persona || player.playername || "Unknown",
    position: player.position,
    posSorted: player.posSorted,
    positionCode:
      typeof player.position === "string" && !isNaN(Number.parseInt(player.position))
        ? Number.parseInt(player.position)
        : null,
    mappedPosition: mapPositionToDisplay(player),
  }
}

/**
 * Maps position data from EA API to display format
 */
export function mapPositionToDisplay(player: any): string {
  // Use posSorted field first if available
  if (player.posSorted) {
    if (player.posSorted === "leftBack") return "LB"
    if (player.posSorted === "rightBack") return "RB"
    if (player.posSorted === "centerBack") return "CB"
    if (player.posSorted === "leftWing") return "LW"
    if (player.posSorted === "rightWing") return "RW"
    if (player.posSorted === "center") return "CM"
    if (player.posSorted === "goalkeeper") return "GK"
  }

  // Fall back to position code mapping
  if (player.position === "0") return "GK"
  if (player.position === "1") return "RB"
  if (player.position === "2") return "LB"
  if (player.position === "3") return "RW"
  if (player.position === "4") return "LW"
  if (player.position === "5") return "CM"

  // Handle text position names
  const positionLower = (player.position || "").toLowerCase()
  if (positionLower === "goalkeeper" || positionLower === "goalie") return "GK"
  if (positionLower === "rightback") return "RB"
  if (positionLower === "leftback") return "LB"
  if (positionLower === "centerback") return "CB"
  if (positionLower === "rightwing") return "RW"
  if (positionLower === "leftwing") return "LW"
  if (positionLower === "center") return "CM"

  // Default to unknown
  return "?"
}
