// Midnight Studios INTl - All rights reserved
"use client"

import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useEffect, useState } from "react"
import { 
  MessageSquare, 
  Users, 
  Trophy, 
  BarChart3, 
  Shield, 
  HelpCircle, 
  FileText, 
  Mail, 
  Settings, 
  User, 
  LogIn, 
  ExternalLink,
  Heart,
  Star,
  Zap,
  Target,
  Home,
  Calendar,
  Handshake,
  Award,
  Crown,
  Globe,
  Phone,
  MapPin,
  UserPlus
} from "lucide-react"
import { motion } from "framer-motion"

export default function Footer() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()
  const currentYear = new Date().getFullYear()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return (
    <footer className="relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-emerald-800 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">FIFA 26 League</h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                </div>
              </div>
              <p className="text-emerald-700 leading-relaxed mb-6">
                The premier competitive FIFA 26 league, powered by Midnight Studios. Join the most exciting football gaming community.
              </p>
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg"
                >
                  <Heart className="h-5 w-5 text-red-500" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg"
                >
                  <Star className="h-5 w-5 text-yellow-500" />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="p-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-lg"
                >
                  <Zap className="h-5 w-5 text-emerald-500" />
                </motion.div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h3 className="font-bold text-xl text-emerald-800 flex items-center gap-2">
                <Home className="h-5 w-5 text-emerald-600" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li><Link href="/" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Home className="h-4 w-4" />Home</Link></li>
                <li><Link href="/standings" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Trophy className="h-4 w-4" />Standings</Link></li>
                <li><Link href="/stats" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><BarChart3 className="h-4 w-4" />Statistics</Link></li>
                <li><Link href="/teams" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Users className="h-4 w-4" />Teams</Link></li>
                <li><Link href="/matches" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Calendar className="h-4 w-4" />Matches</Link></li>
                <li><Link href="/transfers" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Handshake className="h-4 w-4" />Transfers</Link></li>
                <li><Link href="/awards" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Award className="h-4 w-4" />Awards</Link></li>
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="font-bold text-xl text-emerald-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-600" />
                Resources
              </h3>
              <ul className="space-y-3">
                <li><Link href="/rules" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Shield className="h-4 w-4" />Rules</Link></li>
                <li><Link href="/faq" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><HelpCircle className="h-4 w-4" />FAQ</Link></li>
                <li><Link href="/privacy" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Shield className="h-4 w-4" />Privacy Policy</Link></li>
                <li><Link href="/disclaimer" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><FileText className="h-4 w-4" />Disclaimer</Link></li>
                <li><Link href="/contact" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Mail className="h-4 w-4" />Contact Us</Link></li>
                <li><Link href="/forum" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><MessageSquare className="h-4 w-4" />Forum</Link></li>
              </ul>
            </motion.div>

            {/* User Panel */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-bold text-xl text-emerald-800 flex items-center gap-2">
                <User className="h-5 w-5 text-cyan-600" />
                User Panel
              </h3>
              {user ? (
                <ul className="space-y-3">
                  <li><Link href="/management" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Settings className="h-4 w-4" />Management</Link></li>
                  <li><Link href="/admin" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><Crown className="h-4 w-4" />Admin Panel</Link></li>
                </ul>
              ) : (
                <ul className="space-y-3">
                  <li><Link href="/login" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><LogIn className="h-4 w-4" />Sign In</Link></li>
                  <li><Link href="/register" className="text-emerald-700 hover:text-emerald-800 transition-colors duration-200 flex items-center gap-2"><UserPlus className="h-4 w-4" />Sign Up</Link></li>
                </ul>
              )}
              
              {/* Contact Info */}
              <div className="pt-4 border-t border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Connect With Us
                </h4>
                <div className="space-y-2 text-sm text-emerald-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>contact@fifa26league.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Global Community</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-emerald-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex justify-center items-center gap-2 mb-4"
              >
                <div className="h-1 w-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
                <div className="h-1 w-8 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full"></div>
              </motion.div>
              <p className="text-emerald-600 leading-relaxed">
                &copy; {currentYear} FIFA 26 League. All rights reserved.
                <br className="hidden sm:inline" />
                In official partnership with Midnight Studios.
                <br className="hidden sm:inline" />
                This site is an independent entity and is not affiliated with or endorsed by EA Sports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
