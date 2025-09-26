// Midnight Studios INTl - All rights reserved
"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Home, Trophy, BarChart3, Users, Calendar, Handshake, MessageSquare, Shield, LogOut, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const navLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/stats', label: 'Statistics', icon: BarChart3 },
  { href: '/teams', label: 'Teams', icon: Users },
  { href: '/matches', label: 'Matches', icon: Calendar },
  { href: '/transfers', label: 'Transfers', icon: Handshake },
  { href: '/awards', label: 'Awards', icon: Trophy },
  { href: '/forum', label: 'Forum', icon: MessageSquare },
];

export default function Navbar() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        const { data: adminRole } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'Admin')
          .single();
        setIsAdmin(!!adminRole);
      }
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const NavLinks = ({ className }: { className?: string }) => (
    <nav className={className}>
      {navLinks.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link key={link.href} href={link.href} passHref>
            <motion.span 
              className={`cursor-pointer text-sm font-medium transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
                isActive 
                  ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                  : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-4 w-4" />
              {link.label}
            </motion.span>
          </Link>
        );
      })}
      {isAdmin && (
        <Link href="/admin" passHref>
          <motion.span 
            className={`cursor-pointer text-sm font-medium transition-all duration-300 flex items-center gap-2 px-3 py-2 rounded-lg ${
              pathname === '/admin' 
                ? 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                : 'text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-4 w-4" />
            Admin Panel
          </motion.span>
        </Link>
      )}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b border-emerald-200 bg-white/90 backdrop-blur-lg shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" passHref>
          <motion.span 
            className="text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            FIFA 26 League
          </motion.span>
        </Link>
        <div className="hidden md:flex items-center space-x-4">
          <NavLinks className="flex items-center space-x-2" />
          <div className="w-px h-6 bg-emerald-200" />
          {session ? (
            <Button 
              onClick={() => supabase.auth.signOut()} 
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300">
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              </Button>
              <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                <Link href="/register">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-emerald-700 hover:bg-emerald-50">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full bg-white text-emerald-800 border-l-emerald-200">
              <div className="flex flex-col space-y-4 pt-10">
                <NavLinks className="flex flex-col space-y-2" />
                <div className="mt-6 pt-6 border-t border-emerald-200 flex flex-col space-y-2">
                  {session ? (
                    <Button 
                      onClick={() => supabase.auth.signOut()} 
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  ) : (
                    <>
                      <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300">
                        <Link href="/login">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign In
                        </Link>
                      </Button>
                      <Button asChild className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                        <Link href="/register">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
