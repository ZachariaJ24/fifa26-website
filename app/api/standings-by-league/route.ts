// Midnight Studios INTl - All rights reserved

import { NextResponse } from "next/server"
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface Team { 
  id: string;
  name: string;
  logo_url: string;
  conference_id: string;
}

interface Match {
  home_club_id: string;
  away_club_id: string;
  home_score: number;
  away_score: number;
}

interface Standing {
  id: string;
  name: string;
  logo_url: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  games_played: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  form: string[];
  streak: string;
}

interface Conference {
  id: string;
  name: string;
  standings: Standing[];
}

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // 1. Fetch all conferences
    const { data: conferences, error: conferencesError } = await supabase
      .from('conferences')
      .select('id, name')

    if (conferencesError) throw new Error(conferencesError.message)

    // 2. Fetch all teams
    const { data: teams, error: teamsError } = await supabase
      .from('clubs')
      .select('id, name, logo_url, conference_id')

    if (teamsError) throw new Error(teamsError.message)

    // 3. Fetch all matches
    const { data: matches, error: matchesError } = await supabase
      .from('fixtures')
      .select('home_club_id, away_club_id, home_score, away_score')
      .eq('status', 'Completed')

    if (matchesError) throw new Error(matchesError.message)

    // 4. Process and calculate standings for each conference
    const conferencesWithStandings: Conference[] = conferences.map(conference => {
      const conferenceTeams = teams.filter(team => team.conference_id === conference.id)
      
      const standings: Standing[] = conferenceTeams.map(team => {
        let wins = 0
        let draws = 0
        let losses = 0
        let goals_for = 0
        let goals_against = 0

        matches.forEach(match => {
          if (match.home_club_id === team.id) {
            goals_for += match.home_score
            goals_against += match.away_score
            if (match.home_score > match.away_score) wins++
            else if (match.home_score < match.away_score) losses++
            else draws++
          } else if (match.away_club_id === team.id) {
            goals_for += match.away_score
            goals_against += match.home_score
            if (match.away_score > match.home_score) wins++
            else if (match.away_score < match.home_score) losses++
            else draws++
          }
        })

        const games_played = wins + draws + losses
        const points = (wins * 3) + draws;
        const goal_difference = goals_for - goals_against;

        // Calculate Form and Streak
        const teamMatches = matches
          .filter(m => m.home_club_id === team.id || m.away_club_id === team.id)
          // Assuming matches have a date, which they don't in this context.
          // This will need to be added to the matches table to be accurate.
          // For now, we'll proceed without sorting by date, which is not ideal.

        const form: string[] = teamMatches.slice(-5).map(m => {
          if (m.home_club_id === team.id) {
            if (m.home_score > m.away_score) return 'W';
            if (m.home_score < m.away_score) return 'L';
            return 'D';
          } else {
            if (m.away_score > m.home_score) return 'W';
            if (m.away_score < m.home_score) return 'L';
            return 'D';
          }
        });

        let streak = '';
        if (teamMatches.length > 0) {
          const lastResult = form[form.length - 1];
          let count = 0;
          for (let i = form.length - 1; i >= 0; i--) {
            if (form[i] === lastResult) {
              count++;
            } else {
              break;
            }
          }
          streak = `${count}${lastResult}`;
        }

        return {
          id: team.id,
          name: team.name,
          logo_url: team.logo_url,
          wins,
          draws,
          losses,
          points,
          games_played,
          goals_for,
          goals_against,
          goal_difference,
          form,
          streak,
        };
      })

      // Sort standings by points, then goal difference, then goals for
      standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
        return b.goals_for - a.goals_for
      })

      return {
        ...conference,
        standings
      }
    })

    return NextResponse.json({ conferences: conferencesWithStandings })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
