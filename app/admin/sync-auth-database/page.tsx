import type { Metadata } from "next"
import AuthDatabaseSync from "@/components/admin/auth-database-sync"
// import { motion } from "framer-motion"
import { Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Auth to Database Sync - SCS Admin",
  description: "Sync users from Supabase Auth to database tables",
}

export default function SyncAuthDatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <div className="mb-8 text-center">
            <h1 className="hockey-title-enhanced mb-4 flex items-center justify-center gap-3">
              <div className="hockey-feature-icon">
                <Database className="h-6 w-6 text-white" />
              </div>
              Auth to Database Sync
            </h1>
            <p className="hockey-subtitle-enhanced">
              Sync users from Supabase Auth to your application database tables with enhanced security and reliability
            </p>
            <div className="hockey-section-divider mt-6"></div>
          </div>
          <AuthDatabaseSync />
        </div>
      </div>
    </div>
  )
}
