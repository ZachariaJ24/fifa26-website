// Midnight Studios INTl - All rights reserved

import React, { Suspense } from "react"
import HomePageClient from "@/components/public/HomePageClient"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function Home() {
  const supabase = createClient()

  const { data: session } = await supabase.auth.getSession()

  // Fetch stats
  const { count: players } = await supabase.from('players').select('*', { count: 'exact', head: true })
  const { count: teams } = await supabase.from('clubs').select('*', { count: 'exact', head: true })
  const { count: matches } = await supabase.from('fixtures').select('*', { count: 'exact', head: true })

  const stats = {
    players: players || 0,
    teams: teams || 0,
    matches: matches || 0,
  }

  // Fetch featured games (next 2 upcoming matches)
  // Fetch featured games (next 2 upcoming matches)
  const { data: featuredGames } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:clubs!fixtures_home_club_id_fkey (*),
      away_team:clubs!fixtures_away_club_id_fkey (*)
    `)
    .eq('status', 'Scheduled')
    .order('match_date', { ascending: true })
    .limit(2)

  // Fetch upcoming fixtures (next 4 after the featured games)
  const { data: upcomingFixtures } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:clubs!fixtures_home_club_id_fkey (*),
      away_team:clubs!fixtures_away_club_id_fkey (*)
    `)
    .eq('status', 'Scheduled')
    .order('match_date', { ascending: true })
    .range(2, 5) // Fetch next 4 games

  // Fetch recent results (last 4 completed matches)
  const { data: recentResults } = await supabase
    .from('fixtures')
    .select(`
      *,
      home_team:clubs!fixtures_home_club_id_fkey (*),
      away_team:clubs!fixtures_away_club_id_fkey (*)
    `)
    .eq('status', 'Completed')
    .order('match_date', { ascending: false })
    .limit(4)

  // Fetch standings data
  const { data: standingsData } = await supabase
    .from('clubs')
    .select('*, conferences(name)')
    .eq('is_active', true)
    .order('points', { ascending: false });

  const standings = standingsData?.reduce((acc, team) => {
    const conferenceName = team.conferences?.name || 'Unassigned';
    if (!acc[conferenceName]) {
      acc[conferenceName] = [];
    }
    acc[conferenceName].push(team);
    return acc;
  }, {} as Record<string, any[]>);

  // Fetch latest news
  const { data: newsData } = await supabase
    .from('news')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(3)

  const latestNews = newsData?.map(item => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  })) || [];

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <HomePageClient 
        session={session} 
        stats={stats} 
        featuredGames={featuredGames || []} 
        latestNews={latestNews}
        upcomingFixtures={upcomingFixtures || []}
        recentResults={recentResults || []}
        standings={standings || {}}
      />
    </Suspense>
  )
}
