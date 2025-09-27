import { Suspense } from "react"
import { SimpleForumManagement } from "@/components/admin/simple-forum-management"
import { ErrorBoundary } from "@/components/error-boundary"
import { MessageSquare, Users, Shield, Settings, Database, Activity, TrendingUp, Target, Zap, Trophy, Star, Medal, Crown, BarChart3, Clock, Award, BookOpen, FileText, Globe, Publish, AlertTriangle, CheckCircle } from "lucide-react"

export default function AdminForumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-stadium-gold-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Forum Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Comprehensive forum management and moderation tools for the league community. 
              Manage categories, posts, user interactions, and maintain a healthy discussion environment.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">Forum</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Management</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">User</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Moderation</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">Content</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Moderation</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">System</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Settings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border">
          <div className="p-6">
            <ErrorBoundary>
              <Suspense fallback={
                <div className="space-y-4">
                  <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                  <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                </div>
              }>
                <SimpleForumManagement />
              </Suspense>
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  )
}