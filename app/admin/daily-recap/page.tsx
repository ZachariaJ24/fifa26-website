import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import DailyRecap from "@/components/admin/daily-recap"
import DailyRecapsTableMigration from "@/components/admin/daily-recaps-table-migration"
import { Newspaper, Calendar, Trophy, Star, Medal, Crown, Activity, TrendingUp, Users, Target, Zap, Shield, Database, Settings, BarChart3, Clock, Award } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="border shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
            <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-lg w-32 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3 animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AdminDailyRecapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900/30">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Newspaper className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Daily Recap Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Generate and manage daily recaps for league activities, match results, and important announcements.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Daily Recap Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200">Daily Recap Generator</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Generate comprehensive daily recaps for league activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSkeleton />}>
                <DailyRecap />
              </Suspense>
            </CardContent>
          </Card>

          {/* Migration Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-800 dark:text-slate-200">Database Migration</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Manage daily recaps table structure and data migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<LoadingSkeleton />}>
                <DailyRecapsTableMigration />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}