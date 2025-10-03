/**
 * Utility functions for EA Sports NHL API data
 */

// Re-export the centralized position mapping function
export { mapEaPositionToStandard } from "./ea-position-mapper"

/**
 * Determines if a position is a goalie position
 * @param position The position code or abbreviation
 * @returns True if the position is a goalie position
 */
export function isGoaliePosition(position: string): boolean {
  return position === "0" || position === "G" || position.toLowerCase() === "goalie"
}

/**
 * Formats time on ice from seconds to MM:SS format
 * @param seconds Time in seconds
 * @returns Formatted time string
 */
export function formatTimeOnIce(seconds: number): string {
  if (!seconds) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
