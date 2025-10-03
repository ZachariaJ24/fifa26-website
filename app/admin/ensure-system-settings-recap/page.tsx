import { EnsureSystemSettingsRecapMigration } from "@/components/admin/ensure-system-settings-recap-migration"
import { Settings, Database, Shield, Zap } from "lucide-react"

export default function EnsureSystemSettingsRecapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-field-green-800 dark:text-field-green-200 mb-4">
              System Settings Migration
            </h1>
            <p className="text-lg text-field-green-600 dark:text-field-green-400 max-w-3xl mx-auto">
              Ensure system settings are properly configured and migrated for optimal league operations.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
            <div className="p-6">
              <EnsureSystemSettingsRecapMigration />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}