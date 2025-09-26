// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import NewsCard from "@/components/news-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Newspaper, TrendingUp, Calendar, Users, Star, Zap } from "lucide-react"
import { motion } from "framer-motion"

export default function NewsPage() {
  const { supabase } = useSupabase()
  const [news, setNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchNews() {
      try {
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })

        if (error) throw error
        setNews(data || [])
      } catch (error) {
        console.error("Error fetching news:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [supabase])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              League News
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Stay up-to-date with the latest news, announcements, and updates from the FIFA 26 League.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <Newspaper className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">Latest Updates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Trending Stories</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-6"
              >
                <Skeleton className="h-48 w-full rounded-xl bg-emerald-100 mb-4" />
                <Skeleton className="h-4 w-3/4 bg-emerald-100 mb-2" />
                <Skeleton className="h-4 w-1/2 bg-emerald-100" />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && news.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-lg p-12">
              <Newspaper className="h-12 w-12 mx-auto text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-emerald-800 mb-2">No News Yet</h3>
              <p className="text-emerald-600">News articles will appear here once they are published.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
