import { Suspense } from "react"
import PlayerMappingManager from "@/components/admin/player-mapping-manager"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Users, Link, Database, Settings, Target, Zap } from "lucide-react"

export const metadata = {
  title: "Player Mappings | SCS Admin",
  description: "Manage EA Player to SCS Player Mappings",
}

export default function PlayerMappingsPage() {
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
            <h1 className="hockey-title mb-6">
              DarkWolf Mapping Center
            </h1>
            <p className="hockey-subtitle mx-auto mb-12">
              Manage the critical connections between EA Sports players and SCS player profiles. 
              Ensure seamless data synchronization and accurate player identification.
            </p>
            
            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-field-green-500/25 transition-all duration-300">
                    <Link className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-field-green-700 dark:text-field-green-300 mb-2">
                    Active
                  </div>
                  <div className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">
                    Mappings
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-pitch-blue-500/25 transition-all duration-300">
                    <Database className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300 mb-2">
                    EA
                  </div>
                  <div className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">
                    Integration
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-assist-green-500/25 transition-all duration-300">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-assist-green-700 dark:text-assist-green-300 mb-2">
                    SCS
                  </div>
                  <div className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">
                    Players
                  </div>
                  <div className="w-16 h-1 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                </div>
              </div>
              
              <div className="group">
                <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-r from-goal-red-500 to-assist-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-goal-red-500/25 transition-all duration-300">
                    <Settings className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-goal-red-700 dark:text-goal-red-300 mb-2">
                    Sync
                  </div>
                  <div className="text-sm text-field-green-600 dark:text-field-green-400 font-medium">
                    Management
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
        <Suspense fallback={<LoadingSkeleton />}>
          <PlayerMappingManager />
        </Suspense>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Loading Header */}
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-field-green-600 mx-auto mb-4"></div>
        <h1 className="text-3xl font-bold text-field-green-800 dark:text-field-green-200 mb-2">Loading Player Mappings</h1>
        <p className="text-field-green-600 dark:text-field-green-400">Synchronizing EA and SCS player data...</p>
      </div>

      {/* Loading Main Card */}
      <Card className="hockey-card border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20">
        <CardContent className="p-6">
          <Skeleton className="h-8 w-64 mb-2 bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          <Skeleton className="h-4 w-96 mb-4 bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          <div className="grid grid-cols-3 gap-4 mt-8">
            <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
            <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
            <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          </div>
          <Skeleton className="h-64 w-full mt-8 rounded-lg bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
        </CardContent>
      </Card>

      {/* Loading Setup Card */}
      <Card className="hockey-card border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20">
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-2 bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          <Skeleton className="h-4 w-72 mb-4 bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          <div className="space-y-4">
            <Skeleton className="h-20 w-full rounded-lg bg-gradient-to-br from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
