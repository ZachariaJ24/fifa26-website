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

  const getCardSize = (index: number) => {
    // Create varied card sizes for masonry effect
    const patterns = [
      "col-span-2 row-span-2", // Large
      "col-span-1 row-span-1", // Small
      "col-span-1 row-span-1", // Small
      "col-span-2 row-span-1", // Wide
      "col-span-1 row-span-2", // Tall
      "col-span-1 row-span-1", // Small
    ]
    return patterns[index % patterns.length]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Hero Header Section */}
      <div className="relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              FIFA 26 League News
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Stay up to date with the latest FIFA 26 League news, announcements, and updates
            </p>
            
            {/* News Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-field-green-200/50 dark:border-field-green-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg mb-3 mx-auto w-fit">
                  <Newspaper className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-field-green-700 dark:text-field-green-300">
                  {news.length}
                </div>
                <div className="text-xs text-field-green-600 dark:text-field-green-400 font-medium uppercase tracking-wide">
                  Articles
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-pitch-blue-200/50 dark:border-pitch-blue-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg mb-3 mx-auto w-fit">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300">
                  Latest
                </div>
                <div className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 font-medium uppercase tracking-wide">
                  Updates
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-stadium-gold-200/50 dark:border-stadium-gold-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg mb-3 mx-auto w-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-stadium-gold-700 dark:text-stadium-gold-300">
                  League
                </div>
                <div className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 font-medium uppercase tracking-wide">
                  News
                </div>
              </div>
              
              <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-goal-orange-200/50 dark:border-goal-orange-700/50 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out hover:scale-[1.02] hover:-translate-y-2 p-6 text-center">
                <div className="p-2 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg mb-3 mx-auto w-fit">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-goal-orange-700 dark:text-goal-orange-300">
                  Real-time
                </div>
                <div className="text-xs text-goal-orange-600 dark:text-goal-orange-400 font-medium uppercase tracking-wide">
                  Updates
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={`${getCardSize(i)} rounded-xl bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30`} />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {news.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`${getCardSize(index)} relative overflow-hidden rounded-xl cursor-pointer group hover:scale-105 transition-transform duration-200 shadow-lg hover:shadow-xl`}
              >
                <NewsCard news={item} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-field-green-200/50 dark:border-field-green-700/50 rounded-2xl shadow-xl p-12">
              <div className="p-6 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full w-fit mx-auto mb-6">
                <Newspaper className="h-16 w-16 text-field-green-600 dark:text-field-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-field-green-800 dark:text-field-green-200 mb-3">
                No News Articles Yet
              </h2>
              <p className="text-field-green-600 dark:text-field-green-400 text-lg max-w-md mx-auto">
                Check back soon for the latest league updates, player highlights, and community announcements!
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
