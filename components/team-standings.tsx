import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TeamLogo } from "@/components/team-logo"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

// This type should be flexible enough for soccer standings.
// We'll assume the incoming data matches this structure.
export interface TeamStanding {
  id: string
  name: string
  logo_url: string
  games_played: number
  wins: number
  draws: number
  losses: number
  points: number
  goals_for: number
  goals_against: number
  goal_difference: number
  // Optional fields from the original hockey component, can be ignored for soccer
  playoff_status?: "clinched" | "eliminated" | "active"
}

interface TeamStandingsProps {
  teams: TeamStanding[]
}

function getPlayoffStatusIndicator(status?: "clinched" | "eliminated" | "active"): JSX.Element | null {
  if (status === "clinched") {
    return (
      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white text-xs ml-2 px-2 py-1 rounded-full shadow-md" title="Clinched Playoff Spot">
        <span className="font-bold">X</span>
      </Badge>
    )
  }
  if (status === "eliminated") {
    return (
      <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs ml-2 px-2 py-1 rounded-full shadow-md" title="Eliminated from Playoffs">
        <span className="font-bold">E</span>
      </Badge>
    )
  }
  return null
}

export default function TeamStandings({ teams }: TeamStandingsProps) {
  if (!teams || teams.length === 0) {
    return <div className="text-center py-8 text-gray-500 dark:text-gray-400">No teams found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-gray-200 dark:border-gray-700">
            <TableHead className="w-12 text-center font-bold">#</TableHead>
            <TableHead className="min-w-[220px] font-bold">Team</TableHead>
            <TableHead className="text-center font-bold">GP</TableHead>
            <TableHead className="text-center font-bold">W</TableHead>
            <TableHead className="text-center font-bold">D</TableHead>
            <TableHead className="text-center font-bold">L</TableHead>
            <TableHead className="text-center font-bold">GF</TableHead>
            <TableHead className="text-center font-bold">GA</TableHead>
            <TableHead className="text-center font-bold">GD</TableHead>
            <TableHead className="text-center font-bold">PTS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow 
              key={team.id} 
              className="hover:bg-gray-100/50 dark:hover:bg-gray-800/50 border-gray-200 dark:border-gray-700 transition-colors duration-200"
            >
              <TableCell className="font-bold text-center text-gray-800 dark:text-gray-200">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link href={`/teams/${team.id}`} className="flex items-center gap-3 hover:underline group">
                  <div className="flex-shrink-0">
                    <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="sm" />
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold truncate text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                      {team.name}
                    </span>
                    {getPlayoffStatusIndicator(team.playoff_status)}
                  </div>
                </Link>
              </TableCell>
              <TableCell className="text-center text-gray-700 dark:text-gray-300 font-medium">
                {team.games_played}
              </TableCell>
              <TableCell className="text-center font-bold text-green-700 dark:text-green-400">
                {team.wins}
              </TableCell>
              <TableCell className="text-center font-bold text-gray-700 dark:text-gray-300">
                {team.draws}
              </TableCell>
              <TableCell className="text-center font-bold text-red-700 dark:text-red-400">
                {team.losses}
              </TableCell>
              <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                {team.goals_for}
              </TableCell>
              <TableCell className="text-center font-medium text-gray-700 dark:text-gray-300">
                {team.goals_against}
              </TableCell>
              <TableCell className="text-center">
                <span className={`font-bold text-lg ${team.goal_difference >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {team.goal_difference >= 0 ? "+" : ""}
                  {team.goal_difference}
                </span>
              </TableCell>
              <TableCell className="text-center font-bold text-2xl text-blue-700 dark:text-blue-400">
                {team.points}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
