"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { useSupabase } from "@/lib/supabase/client"
import {
  Trophy,
  Users,
  Calendar,
  Target,
  BarChart3,
  Shield,
  ArrowRight,
  ChevronRight,
  MessageSquare
} from "lucide-react"

interface HomePageClientProps {
  session: any
}

export default function HomePageClient({ session }: HomePageClientProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section - Completely New Design */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, #16a34a 2px, transparent 0), radial-gradient(circle at 75px 75px, #0d9488 2px, transparent 0)`,
            backgroundSize: '100px 100px'
          }} />
            </div>

        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
                <motion.div
            initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Main Title - Secret Chel Society Style */}
            <motion.h1 
              className="text-6xl md:text-8xl lg:text-9xl font-black mb-8"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                FIFA 26
              </span>
              <br />
              <span className="bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent">
                LEAGUE
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-xl md:text-2xl lg:text-3xl text-emerald-700 mb-12 font-medium max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              The premier competitive FIFA gaming experience. 
              <br className="hidden md:block" />
              Join elite players in the ultimate football league.
            </motion.p>

            {/* CTA Buttons */}
                  <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
              initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <Button 
                asChild
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105"
              >
                <Link href="/season-registration" className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  JOIN THE LEAGUE
                  <ArrowRight className="w-5 h-5" />
                    </Link>
              </Button>
              
              <Button 
                asChild
                variant="outline" 
                size="lg"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/standings" className="flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  VIEW STANDINGS
                </Link>
              </Button>
              </motion.div>
              </motion.div>
            </div>

        {/* Scroll Indicator */}
                <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <ChevronRight className="w-6 h-6 text-emerald-600 rotate-90" />
                </motion.div>
        </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600" />
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
                  <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              READY TO COMPETE?
            </h2>
            <p className="text-xl mb-12 opacity-90 max-w-2xl mx-auto">
              Join the most competitive FIFA league and prove your skills against the best players. 
              Your championship journey starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button 
                asChild
                size="lg"
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/season-registration" className="flex items-center gap-3">
                  <Trophy className="w-6 h-6" />
                  REGISTER NOW
                </Link>
                    </Button>
              
              <Button 
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/teams" className="flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  EXPLORE TEAMS
                </Link>
                    </Button>
            </div>
                  </motion.div>
          </div>
        </section>
    </div>
  )
}