import { TokenManagement } from "@/components/admin/token-management"
import { Trophy, Award, Medal, Star, Shield, Database, Settings, Zap, Target, Users, CheckCircle, XCircle, AlertTriangle, Coins, Gift, History, Plus, Minus, Edit, Trash2, Search, Clock, RefreshCw } from "lucide-react"

export default function AdminTokensPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-r from-stadium-gold-500 to-goal-orange-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Token Management
            </h1>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Manage player tokens, redeemable items, and redemption requests for the league.
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
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">Player Tokens</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Manage balances</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">Redeemable Items</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Manage rewards</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">Redemptions</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Process requests</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-semibold text-field-green-800 dark:text-field-green-200">System Settings</div>
                <div className="text-sm text-field-green-600 dark:text-field-green-400">Configure system</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <TokenManagement />
          </div>
        </div>
      </div>
    </div>
  )
}