import { FixConsoleValues } from "@/components/admin/fix-console-values"
import { Wrench, Settings, CheckCircle, AlertTriangle } from "lucide-react"

export default function FixConsoleValuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Fix Console Values
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Fix console constraint violations for users that failed to be created in the database with intelligent repair.
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
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Console Fixes</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Repair violations</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Error Detection</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Find issues</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Intelligent Repair</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Smart fixes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <FixConsoleValues />
          </div>
        </div>
      </div>
    </div>
  )
}