import type { Metadata } from "next"
import AuthDatabaseSync from "@/components/admin/auth-database-sync"
import { Database, Users, Shield, Zap } from "lucide-react"

export const metadata: Metadata = {
  title: "Auth to Database Sync - SCS Admin",
  description: "Sync users from Supabase Auth to database tables",
}

export default function SyncAuthDatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
              <Database className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Auth to Database Sync
            </h1>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Sync users from Supabase Auth to your application database tables with enhanced security and reliability.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">User Sync</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Sync auth users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">Security</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Enhanced protection</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">Reliability</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Consistent sync</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <AuthDatabaseSync />
          </div>
        </div>
      </div>
    </div>
  )
}