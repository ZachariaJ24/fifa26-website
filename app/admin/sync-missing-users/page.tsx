import { SyncMissingUsers } from "@/components/admin/sync-missing-users"
// import { motion } from "framer-motion"
import { Users } from "lucide-react"

export default function SyncMissingUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="">
            <div className="mb-8 text-center">
              <h1 className="hockey-title-enhanced mb-4 flex items-center justify-center gap-3">
                <div className="hockey-feature-icon">
                  <Users className="h-6 w-6 text-white" />
                </div>
                Sync Missing Users
              </h1>
              <p className="hockey-subtitle-enhanced">
                Find and sync users who exist in Supabase Auth but are missing from the users table with intelligent detection
              </p>
              <div className="hockey-section-divider mt-6"></div>
            </div>

            <SyncMissingUsers />
          </div>
        </div>
      </div>
    </div>
  )
}
