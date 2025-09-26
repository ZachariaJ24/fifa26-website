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
  const { count: teams } = await supabase.from('teams').select('*', { count: 'exact', head: true })
  const { count: matches } = await supabase.from('matches').select('*', { count: 'exact', head: true })

  const stats = {
    players: players || 0,
    teams: teams || 0,
    matches: matches || 0,
  }

  // Fetch featured games (next 2 upcoming matches)
  const { data: featuredGames } = await supabase
    .from('matches')
    .select(`
      *,
      home_team:teams!matches_home_team_id_fkey (*),
      away_team:teams!matches_away_team_id_fkey (*)
    `)
    .eq('status', 'Scheduled')
    .order('match_date', { ascending: true })
    .limit(2)

  // Placeholder for latest news
  const latestNews = [
    { date: 'Oct 1, 2025', title: 'Season 1 Kicks Off!', excerpt: 'The inaugural season of the FIFA 26 League is officially underway. See the opening day results.' },
    { date: 'Sep 28, 2025', title: 'New Transfer Window Record', excerpt: 'A new record has been set for the most transfers in a single window. The market is hotter than ever.' },
    { date: 'Sep 25, 2025', title: 'Official League Rules Updated', excerpt: 'We have updated our league rules for the upcoming season. Please review them before your first match.' },
  ]

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <HomePageClient session={session} stats={stats} featuredGames={featuredGames || []} latestNews={latestNews} />
    </Suspense>
  )
}
