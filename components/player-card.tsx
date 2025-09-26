// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent } from '@/components/ui/card';
import { TeamLogo } from '@/components/team-logo';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlayerCard() {
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getPlayer = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: playerData, error } = await supabase
          .from('players')
          .select(`
            *,
            teams (*)
          `)
          .eq('user_id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching player data:', error);
        } else {
          setPlayer(playerData);
        }
      }
      setLoading(false);
    };
    getPlayer();
  }, [supabase]);

  if (loading) {
    return (
        <div className="bg-gray-800/50 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-2">
                <Skeleton className="h-12 w-1/3" />
            </div>
        </div>
    );
  }

  if (!player) {
    return null; // Don't render anything if there's no player
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-4">
                <TeamLogo teamName={player.teams?.name || 'Free Agent'} logoUrl={player.teams?.logo_url} size="sm" />
                <div>
                    <p className="font-bold text-white">{player.name}</p>
                    <p className="text-sm text-gray-400">{player.teams?.name || 'Free Agent'}</p>
                </div>
            </div>
        </div>
    </div>
  );
}
