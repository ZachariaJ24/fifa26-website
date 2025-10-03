import { Suspense } from "react"
import { TransferMarketList } from "@/components/free-agency/transfer-market-list"
import { PositionCountsClient } from "@/components/free-agency/position-counts-client"
import { PlayerSignupsList } from "@/components/free-agency/player-signups-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Target, DollarSign } from "lucide-react"

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic"
export const revalidate = 0
export const fetchCache = "force-no-store"

export default function TransferMarketPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pitch-blue-50 via-slate-50 to-field-green-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-field-green-900/30">
      {/* Header Section */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-xl shadow-lg">
                <DollarSign className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 to-pitch-blue-700 dark:from-field-green-400 dark:to-pitch-blue-500 bg-clip-text text-transparent">
                  Transfer Market
                </h1>
                <div className="mt-2">
                  <span className="text-lg text-slate-600 dark:text-slate-400">
                    Sign players and build your championship squad
                  </span>
                </div>
              </div>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mb-8" />
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Discover talented players available for transfer. Sign them to your club and strengthen your squad for the upcoming season.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Position Counts Section */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="text-lg sm:text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Available Players by Position
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Real-time count of players available for transfer in each position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-field-green-600 mx-auto mb-4"></div>
                  <p className="text-slate-600 dark:text-slate-400">Loading position counts...</p>
                </div>
              }>
                <PositionCountsClient />
              </Suspense>
            </CardContent>
          </Card>

          {/* Main Tabs Section */}
          <Tabs defaultValue="transfer-market" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <TabsTrigger value="transfer-market" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-field-green-500 data-[state=active]:to-pitch-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105">
                <Users className="h-4 w-4" />
                Transfer Market
              </TabsTrigger>
              <TabsTrigger value="player-signups" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-stadium-gold-500 data-[state=active]:to-stadium-gold-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 hover:scale-105">
                <FileText className="h-4 w-4" />
                Player Applications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transfer-market" className="space-y-4 mt-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-field-green-50 to-pitch-blue-50 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-lg">
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    Transfer Market
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Browse and sign available players to strengthen your squad
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TransferMarketList searchParams={searchParams} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="player-signups" className="space-y-4 mt-6">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/30 dark:to-stadium-gold-800/30 border-b border-slate-200 dark:border-slate-700">
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-200 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Player Applications
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    New players looking to join the league
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PlayerSignupsList />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
