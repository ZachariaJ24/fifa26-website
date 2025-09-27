import { TransferRecap } from "@/components/admin/transfer-recap"
import { Trophy, Award, Medal, Star, Shield, Database, Settings, Zap, Target, Users, CheckCircle, XCircle, AlertTriangle, DollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react"

export default function TransferRecapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <DollarSign className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Transfer Recap
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Comprehensive overview of all transfer activity and club acquisitions for the league.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Club Statistics</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Team performance</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Player Analysis</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Individual stats</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Financial Overview</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Budget analysis</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-slate-800 dark:text-slate-200">Transfer History</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Transaction log</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <TransferRecap />
          </div>
        </div>
      </div>
    </div>
  )
}