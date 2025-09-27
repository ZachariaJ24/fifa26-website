import { SyncMissingUsers } from "@/components/admin/sync-missing-users"
import { Users, Search, RefreshCw, CheckCircle } from "lucide-react"

export default function SyncMissingUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Sync Missing Users
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Find and sync users who exist in Supabase Auth but are missing from the users table with intelligent detection.
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
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Intelligent Detection</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Find missing users</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Auto Sync</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Automatic synchronization</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Verification</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Data integrity check</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <SyncMissingUsers />
          </div>
        </div>
      </div>
    </div>
  )
}