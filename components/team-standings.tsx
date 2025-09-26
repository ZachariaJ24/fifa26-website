import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TeamLogo } from "@/components/team-logo"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import Link from "next/link"

// This type should be flexible enough for soccer standings.
export interface TeamStanding {
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

const FormBadge = ({ result }: { result: string }) => {
  const baseClasses = "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-white";
  switch (result) {
    case 'W':
      return <div className={`${baseClasses} bg-green-500`}>W</div>;
    case 'L':
      return <div className={`${baseClasses} bg-red-500`}>L</div>;
    case 'D':
      return <div className={`${baseClasses} bg-gray-500`}>D</div>;
    default:
      return null;
  }
};

const StreakBadge = ({ streak }: { streak: string }) => {
  if (!streak) return <span className="text-gray-400">-</span>;
  const type = streak.slice(-1);
  const count = streak.slice(0, -1);
  let color = "bg-gray-500";
  if (type === 'W') color = "bg-green-500";
  if (type === 'L') color = "bg-red-500";
  return <Badge className={`${color} text-white font-bold`}>{`${count} ${type}`} </Badge>;
};

export default function TeamStandings({ teams }: TeamStandingsProps) {
  if (!teams || teams.length === 0) {
    return <div className="text-center py-8 text-gray-400">No teams found.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-white">
        <TableHeader>
          <TableRow className="border-b border-gray-700">
            <TableHead className="w-12 text-center font-bold text-gray-300">#</TableHead>
            <TableHead className="min-w-[220px] font-bold text-gray-300">Team</TableHead>
            <TableHead className="text-center font-bold text-gray-300">GP</TableHead>
            <TableHead className="text-center font-bold text-gray-300">W</TableHead>
            <TableHead className="text-center font-bold text-gray-300">D</TableHead>
            <TableHead className="text-center font-bold text-gray-300">L</TableHead>
            <TableHead className="text-center font-bold text-gray-300">GF</TableHead>
            <TableHead className="text-center font-bold text-gray-300">GA</TableHead>
            <TableHead className="text-center font-bold text-gray-300">GD</TableHead>
            <TableHead className="text-center font-bold text-gray-300">Form</TableHead>
            <TableHead className="text-center font-bold text-gray-300">Streak</TableHead>
            <TableHead className="text-center font-bold text-gray-300">PTS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teams.map((team, index) => (
            <TableRow 
              key={team.id} 
              className="border-b border-gray-800 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <TableCell className="font-bold text-center text-lg text-gray-300">{index + 1}</TableCell>
              <TableCell>
                <Link href={`/teams/${team.id}`} className="flex items-center gap-3 hover:underline group">
                  <TeamLogo teamName={team.name} logoUrl={team.logo_url} size="sm" />
                  <span className="font-semibold text-white group-hover:text-blue-400 transition-colors duration-200">{team.name}</span>
                  {getPlayoffStatusIndicator(team.playoff_status)}
                </Link>
              </TableCell>
              <TableCell className="text-center font-medium text-gray-300">{team.games_played}</TableCell>
              <TableCell className="text-center font-bold text-green-400">{team.wins}</TableCell>
              <TableCell className="text-center font-bold text-gray-300">{team.draws}</TableCell>
              <TableCell className="text-center font-bold text-red-400">{team.losses}</TableCell>
              <TableCell className="text-center font-medium text-gray-300">{team.goals_for}</TableCell>
              <TableCell className="text-center font-medium text-gray-300">{team.goals_against}</TableCell>
              <TableCell className="text-center font-bold text-lg">
                <span className={`${team.goal_difference >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {team.goal_difference >= 0 ? "+" : ""}{team.goal_difference}
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center items-center gap-1">
                  {team.form.map((result, i) => <FormBadge key={i} result={result} />)}
                </div>
              </TableCell>
              <TableCell className="text-center"><StreakBadge streak={team.streak} /></TableCell>
              <TableCell className="text-center font-bold text-2xl text-blue-400">{team.points}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
