// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Thread {
  id: string;
  title: string;
  created_at: string;
  users: {
    gamer_tag_id: string;
  };
}

export default function ForumPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThreads() {
      setLoading(true);
      try {
        const response = await fetch(`/api/threads?forum_id=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch threads');
        const data = await response.json();
        setThreads(data.threads || []);
      } catch (error: any) {
        toast({
          title: 'Error loading threads',
          description: error.message || 'Failed to load threads data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, [toast, params.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Forum Threads</h1>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Thread
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Link href={`/forums/thread/${thread.id}`}>
                  <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm shadow-2xl shadow-blue-500/10 hover:bg-gray-700/50 transition-colors duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-white">{thread.title}</CardTitle>
                      <CardDescription className="text-gray-400">Started by {thread.users.gamer_tag_id} on {new Date(thread.created_at).toLocaleDateString()}</CardDescription>
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
