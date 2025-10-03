"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Shield } from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/teams", label: "Teams" },
  { href: "/standings", label: "Standings" },
  { href: "/stats", label: "Stats" },
  { href: "/matches", label: "Matches" },
  { href: "/awards", label: "Awards" },
  { href: "/transfers", label: "Transfers" },
  { href: "/news", label: "News" },
  { href: "/forum", label: "Forum" },
]

export default function SiteHeader() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">SFS</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm lg:gap-6">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`transition-colors hover:text-foreground/80 ${pathname === href ? 'text-foreground' : 'text-foreground/60'}`}>
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search bar can go here */}
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/register">Register</Link>
            </Button>
          </nav>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <Link href="/" className="mr-6 flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold">SFS</span>
              </Link>
              <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
                <div className="flex flex-col space-y-3">
                  {navLinks.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`text-lg ${pathname === href ? 'font-bold text-primary' : ''}`}>
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
