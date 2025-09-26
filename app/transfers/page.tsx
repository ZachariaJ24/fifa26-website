// Midnight Studios INTl - All rights reserved
"use client"

import React, { useState, useEffect } from "react"
import { useSupabase } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export default function TransfersPage() {
  const { supabase } = useSupabase()
  const [transfers, setTransfers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTransfers() {
      try {
        const { data, error } = await supabase
          .from("transfers")
          .select("*, users(username), from_team:from_team_id(name), to_team:to_team_id(name)")
          .order("transfer_date", { ascending: false })

        if (error) throw error
        setTransfers(data || [])
      } catch (error) {
        console.error("Error fetching transfers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTransfers()
  }, [supabase])

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Transfers</h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">Keep up with the latest player movements in the league.</p>
        </div>

        {loading ? (
          <Skeleton className="h-96 w-full rounded-lg" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>From Team</TableHead>
                <TableHead>To Team</TableHead>
                <TableHead>Transfer Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{transfer.users.username}</TableCell>
                  <TableCell>{transfer.from_team?.name || 'Free Agent'}</TableCell>
                  <TableCell>{transfer.to_team?.name || 'Free Agent'}</TableCell>
                  <TableCell>{new Date(transfer.transfer_date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  )
}
