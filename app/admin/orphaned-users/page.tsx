import { OrphanedUserFinder } from "@/components/admin/orphaned-user-finder"

export default function OrphanedUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-field-green-600 to-pitch-blue-600 bg-clip-text text-transparent fifa-title">Orphaned User Management</h1>
          <p className="text-lg text-field-green-600 dark:text-field-green-400 fifa-subtitle max-w-4xl mx-auto">
            Find and fix users that exist in Supabase Auth but not in your database, or vice versa
          </p>
        </div>

        <OrphanedUserFinder />
      </div>
    </div>
  )
}
