import { PublicTransferRecap } from "@/components/free-agency/public-transfer-recap"
import { Trophy, Award, Medal, Star, Shield, Database, Settings, Zap, Target, Users, CheckCircle, XCircle, AlertTriangle, DollarSign, TrendingUp, Activity, BarChart3 } from "lucide-react"

export default function TransferRecapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-blue-50 via-white to-field-green-50 dark:from-assist-white-900 dark:via-assist-white-800 dark:to-field-green-900/30">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-fifa-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-pitch-blue-500/20 to-field-green-500/20 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-stadium-gold-500/20 to-goal-orange-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-assist-white-500/20 to-pitch-blue-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 rounded-full shadow-2xl shadow-stadium-gold-500/30">
              <DollarSign className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-stadium-gold-600 via-goal-orange-600 to-stadium-gold-800 dark:from-stadium-gold-400 dark:via-goal-orange-400 dark:to-stadium-gold-600 bg-clip-text text-transparent leading-tight">
            Transfer Market Recap
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Complete overview of all transfer market activity and club acquisitions
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-pitch-blue-100/50 to-field-green-100/50 dark:from-pitch-blue-900/20 dark:to-field-green-900/20 px-4 py-2 rounded-full border border-pitch-blue-200/50 dark:border-field-green-700/50">
              <Trophy className="h-4 w-4 text-pitch-blue-600 dark:text-pitch-blue-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Club Statistics</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-stadium-gold-100/50 to-stadium-gold-100/50 dark:from-stadium-gold-900/20 dark:to-stadium-gold-900/20 px-4 py-2 rounded-full border border-stadium-gold-200/50 dark:border-stadium-gold-700/50">
              <Users className="h-4 w-4 text-stadium-gold-600 dark:text-stadium-gold-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Player Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-goal-orange-100/50 to-goal-orange-100/50 dark:from-goal-orange-900/20 dark:to-goal-orange-900/20 px-4 py-2 rounded-full border border-goal-orange-200/50 dark:border-goal-orange-700/50">
              <BarChart3 className="h-4 w-4 text-goal-orange-600 dark:text-goal-orange-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Financial Overview</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-assist-white-100/50 to-assist-white-100/50 dark:from-assist-white-900/20 dark:to-assist-white-900/20 px-4 py-2 rounded-full border border-assist-white-200/50 dark:border-assist-white-700/50">
              <Activity className="h-4 w-4 text-assist-white-600 dark:text-assist-white-400" />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Transfer History</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <PublicTransferRecap />
      </div>
    </div>
  )
}
