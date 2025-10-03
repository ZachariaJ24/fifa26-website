// Midnight Studios INTl - All rights reserved

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function StatisticsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900/20 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <Skeleton className="h-12 w-1/2 mx-auto mb-4 bg-gray-700" />
          <Skeleton className="h-6 w-3/4 mx-auto bg-gray-600" />
        </div>

        {/* Tabs Skeleton */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-10 w-full max-w-md bg-gray-700 rounded-lg" />
        </div>

        {/* Stat Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-gray-800/50 border-gray-700">
              <CardHeader><Skeleton className="h-6 w-3/4 bg-gray-600" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-1/2 bg-gray-700" /></CardContent>
            </Card>
          ))}
        </div>

        {/* Table Skeleton */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <Skeleton className="h-8 w-1/4 bg-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-gray-600" />
                    <Skeleton className="h-4 w-1/2 bg-gray-600" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
