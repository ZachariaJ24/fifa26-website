import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TeamLogo } from "@/components/team-logo"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

// This type should be flexible enough for soccer standings.
export interface ClubStanding {
  id: string;
  name: string;
  logo_url: string;
  games_played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  form: string[];
  streak: string;
  playoff_status?: "clinched" | "eliminated" | "active";
}

interface ClubStandingsProps {
  clubs: ClubStanding[]
}

function getPlayoffStatusIndicator(status?: "clinched" | "eliminated" | "active"): JSX.Element | null {
  if (!status) return null;
  
  switch (status) {
    case "clinched":
      return <Badge variant="default" className="bg-green-500">✓</Badge>;
    case "eliminated":
      return <Badge variant="destructive">✗</Badge>;
    case "active":
      return <Badge variant="secondary">●</Badge>;
    default:
      return null;
  }
}

function getFormColor(result: string): string {
  switch (result) {
    case "W":
      return "bg-green-500 text-white";
    case "D":
      return "bg-yellow-500 text-white";
    case "L":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-300 text-gray-700";
  }
}

export function ClubStandings({ clubs }: ClubStandingsProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="min-w-48">Club</TableHead>
            <TableHead className="w-16 text-center">GP</TableHead>
            <TableHead className="w-16 text-center">W</TableHead>
            <TableHead className="w-16 text-center">D</TableHead>
            <TableHead className="w-16 text-center">L</TableHead>
            <TableHead className="w-16 text-center">PTS</TableHead>
            <TableHead className="w-20 text-center">GF</TableHead>
            <TableHead className="w-20 text-center">GA</TableHead>
            <TableHead className="w-20 text-center">GD</TableHead>
            <TableHead className="w-24 text-center">Form</TableHead>
            <TableHead className="w-16 text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clubs.map((club, index) => (
            <TableRow key={club.id} className="hover:bg-muted/50">
              <TableCell className="font-medium text-center">
                {index + 1}
              </TableCell>
              <TableCell>
                <Link href={`/clubs/${club.id}`} className="flex items-center space-x-3 hover:underline">
                  <TeamLogo
                    teamName={club.name}
                    logoUrl={club.logo_url}
                    size="sm"
                  />
                  <span className="font-medium">{club.name}</span>
                </Link>
              </TableCell>
              <TableCell className="text-center">{club.games_played}</TableCell>
              <TableCell className="text-center">{club.wins}</TableCell>
              <TableCell className="text-center">{club.draws}</TableCell>
              <TableCell className="text-center">{club.losses}</TableCell>
              <TableCell className="text-center font-bold">{club.points}</TableCell>
              <TableCell className="text-center">{club.goals_for}</TableCell>
              <TableCell className="text-center">{club.goals_against}</TableCell>
              <TableCell className="text-center">
                <span className={club.goal_difference > 0 ? "text-green-600" : club.goal_difference < 0 ? "text-red-600" : ""}>
                  {club.goal_difference > 0 ? `+${club.goal_difference}` : club.goal_difference}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex space-x-1 justify-center">
                  {club.form.slice(-5).map((result, i) => (
                    <span
                      key={i}
                      className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${getFormColor(result)}`}
                    >
                      {result}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {getPlayoffStatusIndicator(club.playoff_status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
