import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import DailyRecap from "@/components/admin/daily-recap"
import DailyRecapsTableMigration from "@/components/admin/daily-recaps-table-migration"
import { Newspaper, Calendar, Trophy, Star, Medal, Crown, Activity, TrendingUp, Users, Target, Zap, Shield, Database, Settings, BarChart3, Clock, Award } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Card className="hockey-card border-2 border-field-green-200 dark:border-field-green-700 overflow-hidden">
        <CardContent className="p-8">
          <div className="">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-800 dark:to-pitch-blue-800 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-1/2"></div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-12 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-800 dark:to-pitch-blue-800 rounded-lg w-32"></div>
              <div className="h-12 bg-gradient-to-r from-assist-green-200 to-goal-red-200 dark:from-assist-green-800 dark:to-goal-red-800 rounded-lg w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="hockey-card border-2 border-pitch-blue-200 dark:border-pitch-blue-700 overflow-hidden">
        <CardContent className="p-8">
          <div className="">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-200 to-field-green-200 dark:from-pitch-blue-800 dark:to-field-green-800 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-2/3"></div>
                <div className="h-4 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-1/3"></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-full"></div>
              <div className="h-4 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-5/6"></div>
              <div className="h-4 bg-gradient-to-r from-field-green-200 to-pitch-blue-200 dark:from-field-green-700 dark:to-pitch-blue-800 rounded w-4/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function DailyRecapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-hockey-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-field-green-200/30 to-pitch-blue-200/30 rounded-full blur-3xl "></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-assist-green-200/30 to-goal-red-200/30 rounded-full blur-3xl " style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 to-pitch-blue-600 bg-clip-text text-transparent mb-6">
              Daily Recap Management
            </h1>
            <p className="text-lg text-slate-700 dark:text-slate-300 mx-auto mb-12 max-w-4xl">
              Generate and manage comprehensive daily recaps for recent matches. 
              Create engaging content that highlights key moments, player performances, and league updates.
            </p>
            
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-field-green-500/25 transition-all duration-300">
                    <Newspaper className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Daily
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Recaps
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-pitch-blue-500/25 transition-all duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300 mb-2">
                    Match
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Coverage
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-assist-green-500/25 transition-all duration-300">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-assist-green-700 dark:text-assist-green-300 mb-2">
                    Player
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Highlights
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-goal-red-500 to-assist-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-goal-red-500/25 transition-all duration-300">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-goal-red-700 dark:text-goal-red-300 mb-2">
                    League
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                    Updates
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-goal-red-500 to-assist-green-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            Recap Management Center
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Create engaging daily recaps that capture the excitement of recent matches, 
            highlight standout performances, and keep the league community informed.
          </p>
        </div>

        {/* Enhanced Content Areas */}
        <div className="space-y-8">
          {/* Daily Recaps Table Migration */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Recap Data Management
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and organize daily recap data and migration tools.
              </p>
            </div>
            <DailyRecapsTableMigration />
          </div>

          {/* Daily Recap Generator */}
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                Daily Recap Generator
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Generate comprehensive daily recaps for recent matches and league activities.
              </p>
            </div>
            <Suspense fallback={<LoadingSkeleton />}>
              <DailyRecap />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
