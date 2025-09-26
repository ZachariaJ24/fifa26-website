// Midnight Studios INTl - All rights reserved
"use client"

import React from "react"
import { MessageSquare, Users, TrendingUp, Calendar, Star, Zap, Construction, Hammer } from "lucide-react"
import { motion } from "framer-motion"

export default function ForumPage() {
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
              Community Forum
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Join the discussion with other players in the FIFA 26 League community.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">Community Discussions</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <Users className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Player Network</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Construction Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Construction className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Forum Under Construction</h2>
                <p className="text-emerald-100 text-sm">
                  We're building an amazing community experience for you
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hammer className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-800 mb-4">Coming Soon!</h3>
              <p className="text-emerald-700 text-lg max-w-2xl mx-auto">
                We're working hard to create the best community forum experience for FIFA 26 League players. 
                Stay tuned for updates!
              </p>
            </motion.div>

            {/* Feature Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-6">
                <MessageSquare className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                <h4 className="font-bold text-emerald-800 mb-2">Discussion Boards</h4>
                <p className="text-emerald-600 text-sm">Share strategies, tactics, and league discussions</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-6">
                <Users className="h-8 w-8 text-teal-600 mx-auto mb-3" />
                <h4 className="font-bold text-emerald-800 mb-2">Player Profiles</h4>
                <p className="text-emerald-600 text-sm">Connect with other players and build your network</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl p-6">
                <TrendingUp className="h-8 w-8 text-cyan-600 mx-auto mb-3" />
                <h4 className="font-bold text-emerald-800 mb-2">Live Updates</h4>
                <p className="text-emerald-600 text-sm">Real-time notifications and trending topics</p>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6"
            >
              <h4 className="font-bold text-emerald-800 mb-3">Stay Updated</h4>
              <p className="text-emerald-700 mb-4">
                Follow our Discord server for the latest updates and community discussions while we build the forum.
              </p>
              <div className="flex justify-center gap-4">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg px-4 py-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-emerald-700 font-medium">Discord Community</span>
                </div>
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg px-4 py-2">
                  <Zap className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-700 font-medium">Live Updates</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
