import Link from "next/link"
import { Shield } from "lucide-react"

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Shield className="h-6 w-6 text-primary" />
          <p className="text-center text-sm leading-loose md:text-left">
            Built by Midnight Studios INTL. The source code is available on{" "}
            <Link
              href="https://github.com/ZachariaJ24/fifa26-website"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4">
              GitHub
            </Link>
            .
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="text-sm font-medium text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
