// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { TeamLogo } from '@/components/team-logo';

interface Transfer {
  id: string;
  listing_date: string;
  players: Player;
  teams: Team; // This will be the new team
}

interface Player {
  id: string;
  name: string;
  teams: Team; // This will be the old team
}

interface Team {
  id: string;
  name: string;
  logo_url: string | null;
}

export default function TransferRecapPage() {
  const { toast } = useToast();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransfers() {
      setLoading(true);
      try {
        const response = await fetch('/api/transfer-recap');
        if (!response.ok) throw new Error('Failed to fetch transfer recap');
        const data = await response.json();
        setTransfers(data.transfers || []);
      } catch (error: any) {
        toast({
          title: 'Error loading transfer recap',
          description: error.message || 'Failed to load transfer recap data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTransfers();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Transfer Recap</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">A summary of all completed transfers in the league.</p>
        </div>

        <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
          <CardContent className="p-4">
            {loading ? (
              <Skeleton className="h-96 w-full rounded-xl" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700/50">
                    <TableHead className="text-white font-bold">Player</TableHead>
                    <TableHead className="text-white font-bold">From</TableHead>
                    <TableHead className="text-white font-bold"></TableHead>
                    <TableHead className="text-white font-bold">To</TableHead>
                    <TableHead className="text-white font-bold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((transfer) => (
                    <TableRow key={transfer.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell className="font-bold">{transfer.players.name}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        <TeamLogo teamName={transfer.players.teams.name} logoUrl={transfer.players.teams.logo_url} size="sm" />
                        {transfer.players.teams.name}
                      </TableCell>
                      <TableCell>
                        <ArrowRight className="w-5 h-5 text-green-400" />
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <TeamLogo teamName={transfer.teams.name} logoUrl={transfer.teams.logo_url} size="sm" />
                        {transfer.teams.name}
                      </TableCell>
                      <TableCell>{new Date(transfer.listing_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
