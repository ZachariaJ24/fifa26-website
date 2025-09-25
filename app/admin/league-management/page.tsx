import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DivisionManagement } from "@/components/admin/division-management"
import { TeamManagement } from "@/components/admin/team-management"
import { PromotionRelegation } from "@/components/admin/promotion-relegation"
import { Trophy, Users, ArrowUpDown } from "lucide-react"

export default function LeagueManagementPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-slate-50 to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-hockey-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-ice-blue-500/20 to-rink-blue-500/20 rounded-full animate-float"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-assist-green-500/20 to-goal-red-500/20 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-hockey-silver-500/20 to-ice-blue-500/20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 rounded-full shadow-2xl shadow-ice-blue-500/30">
              <Trophy className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="hockey-title mb-4">
            League Management
          </h1>
          <p className="hockey-subtitle mb-8">
            Manage divisions, teams, and promotion/relegation system
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">
        <Tabs defaultValue="divisions" className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="grid grid-cols-3 w-full max-w-2xl gap-3 p-2 bg-gradient-to-r from-ice-blue-100/80 to-rink-blue-100/80 dark:from-ice-blue-900/40 dark:to-rink-blue-900/40 rounded-2xl border-2 border-ice-blue-200/60 dark:border-rink-blue-700/60 shadow-xl backdrop-blur-sm">
              <TabsTrigger 
                value="divisions" 
                className="px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-ice-blue-500 data-[state=active]:to-rink-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 font-semibold text-lg"
              >
                <Trophy className="h-5 w-5" />
                Divisions
              </TabsTrigger>
              <TabsTrigger 
                value="teams" 
                className="px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-ice-blue-500 data-[state=active]:to-rink-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 font-semibold text-lg"
              >
                <Users className="h-5 w-5" />
                Teams
              </TabsTrigger>
              <TabsTrigger 
                value="promotion-relegation" 
                className="px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-ice-blue-500 data-[state=active]:to-rink-blue-600 data-[state=active]:text-white data-[state=active]:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-3 font-semibold text-lg"
              >
                <ArrowUpDown className="h-5 w-5" />
                Promotion/Relegation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="divisions">
            <DivisionManagement />
          </TabsContent>

          <TabsContent value="teams">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="promotion-relegation">
            <PromotionRelegation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
