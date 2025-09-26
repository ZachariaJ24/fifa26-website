// Midnight Studios INTl - All rights reserved

import React, { Suspense } from "react"
import HomePageClient from "@/components/public/HomePageClient"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <HomePageClient />
    </Suspense>
  )
}
