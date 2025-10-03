// Midnight Studios INTl - All rights reserved

import React, { Suspense } from "react"
import HomePageClient from "@/components/public/HomePageClient"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient, createAdminClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function Home() {
  const supabase = createClient()
  const adminSupabase = createAdminClient()

  const { data: session } = await adminSupabase.auth.getSession()

  // Fetch stats with error handling
  let playersCount = 0;
  let teamsCount = 0;
  let matchesCount = 0;
  // Try to get players count with fallback using admin client
  try {
    const { count: players, error: playersError } = await adminSupabase
      .from('players')
      .select('id', { count: 'exact', head: true });
    
    if (playersError) {
      console.error('Players count error:', playersError);
      // Fallback: try getting from users table instead
      const { count: usersCount } = await adminSupabase
        .from('users')
        .select('id', { count: 'exact', head: true });
      playersCount = usersCount || 0;
    } else {
      playersCount = players || 0;
    }
  } catch (error) {
    console.error('Players count failed completely:', error);
    playersCount = 0;
  }

  // Get teams count using admin client
  try {
    const { count: teams, error: teamsError } = await adminSupabase
      .from('clubs')
      .select('id', { count: 'exact', head: true });
    
    if (teamsError) {
      console.error('Teams count error:', teamsError);
    }
    teamsCount = teams || 0;
  } catch (error) {
    console.error('Teams count failed:', error);
    teamsCount = 0;
  }

  // Get matches count using admin client
  try {
    const { count: matches, error: matchesError } = await adminSupabase
      .from('fixtures')
      .select('id', { count: 'exact', head: true });
    
    if (matchesError) {
      console.error('Matches count error:', matchesError);
    }
    matchesCount = matches || 0;
  } catch (error) {
    console.error('Matches count failed:', error);
    matchesCount = 0;
  }

  const stats = {
    players: playersCount,
    teams: teamsCount,
    matches: matchesCount,
  }

  // Fetch featured games with error handling
  let featuredGames = [];
  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:clubs!fixtures_home_club_id_fkey (*),
        away_team:clubs!fixtures_away_club_id_fkey (*)
      `)
      .eq('status', 'Scheduled')
      .order('match_date', { ascending: true })
      .limit(2);
    
    if (error) {
      console.error('Featured games error:', error);
    } else {
      featuredGames = data || [];
    }
  } catch (error) {
    console.error('Featured games failed:', error);
  }

  // Fetch upcoming fixtures with error handling
  let upcomingFixtures = [];
  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:clubs!fixtures_home_club_id_fkey (*),
        away_team:clubs!fixtures_away_club_id_fkey (*)
      `)
      .eq('status', 'Scheduled')
      .order('match_date', { ascending: true })
      .range(2, 5);
    
    if (error) {
      console.error('Upcoming fixtures error:', error);
    } else {
      upcomingFixtures = data || [];
    }
  } catch (error) {
    console.error('Upcoming fixtures failed:', error);
  }

  // Fetch recent results with error handling
  let recentResults = [];
  try {
    const { data, error } = await supabase
      .from('fixtures')
      .select(`
        *,
        home_team:clubs!fixtures_home_club_id_fkey (*),
        away_team:clubs!fixtures_away_club_id_fkey (*)
      `)
      .eq('status', 'Completed')
      .order('match_date', { ascending: false })
      .limit(4);
    
    if (error) {
      console.error('Recent results error:', error);
    } else {
      recentResults = data || [];
    }
  } catch (error) {
    console.error('Recent results failed:', error);
  }

  // Fetch standings data with error handling
  let standingsData = [];
  try {
    const { data, error } = await supabase
      .from('clubs')
      .select('*, conferences(name)')
      .eq('is_active', true)
      .order('points', { ascending: false });
    
    if (error) {
      console.error('Standings error:', error);
    } else {
      standingsData = data || [];
    }
  } catch (error) {
    console.error('Standings failed:', error);
  }

  const standings = standingsData?.reduce((acc, team) => {
    const conferenceName = team.conferences?.name || 'Unassigned';
    if (!acc[conferenceName]) {
      acc[conferenceName] = [];
    }
    acc[conferenceName].push(team);
    return acc;
  }, {} as Record<string, any[]>);

  // Fetch latest news with error handling
  let latestNews = [];
  try {
    const { data: newsData, error } = await supabase
      .from('news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.error('News error:', error);
    } else {
      latestNews = newsData?.map(item => ({
        ...item,
        date: new Date(item.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
      })) || [];
    }
  } catch (error) {
    console.error('News failed:', error);
  }

  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <HomePageClient 
        session={session} 
        stats={stats} 
        featuredGames={featuredGames} 
        latestNews={latestNews}
        upcomingFixtures={upcomingFixtures}
        recentResults={recentResults}
        standings={standings || {}}
      />
    </Suspense>
  )
}
