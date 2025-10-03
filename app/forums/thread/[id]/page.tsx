// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User } from 'lucide-react';
import { motion } from 'framer-motion';

interface Post {
  id: string;
  content: string;
  created_at: string;
  users: {
    gamer_tag_id: string;
  };
}

export default function ThreadPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      setLoading(true);
      try {
        const response = await fetch(`/api/posts?thread_id=${params.id}`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (error: any) {
        toast({
          title: 'Error loading posts',
          description: error.message || 'Failed to load posts data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, [toast, params.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/30 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent tracking-tight">Thread</h1>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm shadow-2xl shadow-blue-500/10">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <User className="w-8 h-8 text-blue-400" />
                    <div>
                        <CardTitle className="text-lg font-bold text-white">{post.users.gamer_tag_id}</CardTitle>
                        <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{post.content}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8">
            <Card className="bg-gray-800/50 border border-gray-700 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Reply</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Write your reply..." />
                </CardContent>
                <CardFooter>
                    <Button>Post Reply</Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
