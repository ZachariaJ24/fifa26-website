/**
 * Normalizes position names to standard abbreviations
 * Handles both full names and abbreviations
 */
export function normalizePosition(position: string | null | undefined): string | null {
  if (!position) return null

  const normalized = position.toString().trim().toLowerCase()

  const positionMap: Record<string, string> = {
    // Goalkeeper variations
    goalkeeper: "GK",
    gk: "GK",
    goalie: "GK",
    g: "GK",

    // Right Back variations
    "right back": "RB",
    rb: "RB",
    rightback: "RB",
    "right-back": "RB",

    // Left Back variations
    "left back": "LB",
    lb: "LB",
    leftback: "LB",
    "left-back": "LB",

    // Center Back variations
    "center back": "CB",
    cb: "CB",
    centerback: "CB",
    "center-back": "CB",
    "centre back": "CB",
    centreback: "CB",
    "centre-back": "CB",

    // Right Wing variations
    "right wing": "RW",
    rw: "RW",
    rightwing: "RW",
    "right-wing": "RW",

    // Left Wing variations
    "left wing": "LW",
    lw: "LW",
    leftwing: "LW",
    "left-wing": "LW",

    // Central Midfielder variations
    "central midfielder": "CM",
    cm: "CM",
    centralmidfielder: "CM",
    "central-midfielder": "CM",

    // Defensive Midfielder variations
    "defensive midfielder": "CDM",
    cdm: "CDM",
    defensivemidfielder: "CDM",
    "defensive-midfielder": "CDM",

    // Attacking Midfielder variations
    "attacking midfielder": "CAM",
    cam: "CAM",
    attackingmidfielder: "CAM",
    "attacking-midfielder": "CAM",

    // Striker variations
    striker: "ST",
    st: "ST",
    "center forward": "ST",
    cf: "ST",
    "centre forward": "ST",
  }

  return positionMap[normalized] || position
}

/**
 * Gets the full position name from an abbreviation
 */
export function getFullPositionName(abbreviation: string | null | undefined): string | null {
  if (!abbreviation) return null

  const abbr = abbreviation.toString().trim().toUpperCase()

  const positionMap: Record<string, string> = {
    GK: "Goalkeeper",
    RB: "Right Back",
    LB: "Left Back",
    CB: "Center Back",
    RW: "Right Wing",
    LW: "Left Wing",
    CM: "Central Midfielder",
    CDM: "Defensive Midfielder",
    CAM: "Attacking Midfielder",
    ST: "Striker",
    CF: "Center Forward",
  }

  return positionMap[abbr] || abbreviation
}

/**
 * Gets the position abbreviation from a full name or abbreviation
 */
export function getPositionAbbreviation(position: string | null | undefined): string | null {
  return normalizePosition(position)
}
