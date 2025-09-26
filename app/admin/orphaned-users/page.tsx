import { OrphanedUserFinder } from "@/components/admin/orphaned-user-finder"

export default function OrphanedUsersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-field-green-800 dark:text-field-green-200 fifa-title">Orphaned User Management</h1>
          <p className="text-field-green-600 dark:text-field-green-400 fifa-subtitle">
            Find and fix users that exist in Supabase Auth but not in your database, or vice versa
          </p>
        </div>

        <OrphanedUserFinder />
      </div>
    </div>
  )
}
