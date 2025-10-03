// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Forum {
  id: string;
  name: string;
  description: string;
}

export default function ForumsPage() {
  const { toast } = useToast();
  const [forums, setForums] = useState<Forum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchForums() {
      setLoading(true);
      try {
        const response = await fetch('/api/forums');
        if (!response.ok) throw new Error('Failed to fetch forums');
        const data = await response.json();
        setForums(data.forums || []);
      } catch (error: any) {
        toast({
          title: 'Error loading forums',
          description: error.message || 'Failed to load forums data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchForums();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Forums</h1>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">Discuss the league, teams, and players with the community.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {forums.map((forum) => (
              <motion.div
                key={forum.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/forums/${forum.id}`}>
                  <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm shadow-2xl shadow-blue-500/10 hover:bg-gray-700/50 transition-colors duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white flex items-center gap-3">
                        <MessageSquare className="text-blue-400" />
                        {forum.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400">{forum.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
