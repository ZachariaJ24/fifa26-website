// EA Position Code to Soccer Position Name Mapping
export const eaPositionMap: Record<string, string> = {
  "0": "GK", // Goalkeeper
  "1": "RB", // Right Back
  "2": "LB", // Left Back
  "3": "RW", // Right Wing
  "4": "LW", // Left Wing
  "5": "CM", // Central Midfielder
  "6": "CB", // Center Back
  "7": "ST", // Striker
  "8": "CDM", // Defensive Midfielder
  "9": "CAM", // Attacking Midfielder
}

// Soccer Position to Category Mapping
export const positionCategoryMap: Record<string, string> = {
  GK: "goalkeeper",
  RB: "defense",
  LB: "defense",
  CB: "defense",
  RW: "midfield",
  LW: "midfield",
  CM: "midfield",
  CDM: "midfield",
  CAM: "midfield",
  ST: "forward",
  CF: "forward",
}

// Get category based on EA position code
export function getCategoryFromEA(eaPositionCode: string) {
  const position = eaPositionMap[eaPositionCode]
  return positionCategoryMap[position] || "unknown"
}

// Get category based on standard position
export function getPositionCategory(position: string) {
  // Standardize the position first
  const standardPosition = mapEaPositionToStandard(position)
  return positionCategoryMap[standardPosition] || "unknown"
}

// Map EA position code or name to standard soccer position
export function mapEaPositionToStandard(position: string): string {
  // If it's a numeric code, use the mapping
  if (eaPositionMap[position]) {
    return eaPositionMap[position]
  }

  // Handle PosSorted field specifically (this is the most accurate source)
  if (position === "leftBack") return "LB"
  if (position === "rightBack") return "RB"
  if (position === "centerBack") return "CB"
  if (position === "leftWing") return "LW"
  if (position === "rightWing") return "RW"
  if (position === "centralMidfielder") return "CM"
  if (position === "striker") return "ST"
  if (position === "goalkeeper") return "GK"

  // Handle text position names
  const positionLower = position.toLowerCase()
  if (positionLower === "goalkeeper" || positionLower === "gk" || positionLower === "goalie" || positionLower === "g") {
    return "GK"
  }
  if (positionLower === "right back" || positionLower === "rb" || positionLower === "rightback") {
    return "RB"
  }
  if (positionLower === "left back" || positionLower === "lb" || positionLower === "leftback") {
    return "LB"
  }
  if (positionLower === "center back" || positionLower === "cb" || positionLower === "centerback" || positionLower === "centre back" || positionLower === "centreback") {
    return "CB"
  }
  if (positionLower === "right wing" || positionLower === "rw" || positionLower === "rightwing") {
    return "RW"
  }
  if (positionLower === "left wing" || positionLower === "lw" || positionLower === "leftwing") {
    return "LW"
  }
  if (positionLower === "central midfielder" || positionLower === "cm" || positionLower === "centralmidfielder") {
    return "CM"
  }
  if (positionLower === "defensive midfielder" || positionLower === "cdm" || positionLower === "defensivemidfielder") {
    return "CDM"
  }
  if (positionLower === "attacking midfielder" || positionLower === "cam" || positionLower === "attackingmidfielder") {
    return "CAM"
  }
  if (positionLower === "striker" || positionLower === "st" || positionLower === "center forward" || positionLower === "cf") {
    return "ST"
  }

  // Default to the original position if no mapping found
  return position
}
