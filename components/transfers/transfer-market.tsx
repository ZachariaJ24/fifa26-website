"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, DollarSign, Users, TrendingUp, CheckCircle, XCircle } from "lucide-react"

interface TransferOffer {
  id: string
  player_id: string
  from_team_id: string
  to_team_id: string
  offer_amount: number
  status: string
  expires_at: string
  created_at: string
  player: {
    id: string
    name: string
    position: string
    overall_rating: number
    salary: number
  }
  from_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
  to_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
}

interface Signing {
  id: string
  player_id: string
  team_id: string
  signing_amount: number
  contract_length: number
  status: string
  created_at: string
  player: {
    id: string
    name: string
    position: string
    overall_rating: number
  }
  team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
}

interface CompletedTransfer {
  id: string
  player_id: string
  from_team_id: string
  to_team_id: string
  transfer_amount: number
  transfer_date: string
  player: {
    id: string
    name: string
    position: string
    overall_rating: number
  }
  from_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
  to_team: {
    id: string
    name: string
    logo_url?: string
    conferences?: {
      id: string
      name: string
      color: string
    }
  }
}

export function TransferMarket() {
  const [offers, setOffers] = useState<TransferOffer[]>([])
  const [signings, setSignings] = useState<Signing[]>([])
  const [transfers, setTransfers] = useState<CompletedTransfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTransferData()
  }, [])

  const fetchTransferData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch offers
      const offersResponse = await fetch('/api/transfers?type=offers')
      if (offersResponse.ok) {
        const offersData = await offersResponse.json()
        setOffers(offersData)
      }

      // Fetch signings
      const signingsResponse = await fetch('/api/transfers?type=signings')
      if (signingsResponse.ok) {
        const signingsData = await signingsResponse.json()
        setSignings(signingsData)
      }

      // Fetch completed transfers
      const transfersResponse = await fetch('/api/transfers?type=completed')
      if (transfersResponse.ok) {
        const transfersData = await transfersResponse.json()
        setTransfers(transfersData)
      }
    } catch (error: any) {
      console.error("Error fetching transfer data:", error)
      setError(error.message || "Failed to fetch transfer data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transfer Market</h2>
        <Button onClick={fetchTransferData} variant="outline">
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="offers" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="offers">Offers ({offers.length})</TabsTrigger>
          <TabsTrigger value="signings">Signings ({signings.length})</TabsTrigger>
          <TabsTrigger value="transfers">Transfers ({transfers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="offers" className="space-y-4">
          {offers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">No transfer offers found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {offers.map((offer) => (
                <Card key={offer.id} className="fifa-card fifa-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{offer.player.name}</CardTitle>
                      <Badge className={getStatusColor(offer.status)}>
                        {offer.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{offer.player.position}</Badge>
                      <Badge variant="secondary">OVR {offer.player.overall_rating}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">From:</span>
                        <span className="font-medium">{offer.from_team.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">To:</span>
                        <span className="font-medium">{offer.to_team.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Offer:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(offer.offer_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires:</span>
                        <span className="text-sm">
                          {formatDate(offer.expires_at)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="signings" className="space-y-4">
          {signings.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">No signings found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {signings.map((signing) => (
                <Card key={signing.id} className="fifa-card fifa-card-hover">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{signing.player.name}</CardTitle>
                      <Badge className={getStatusColor(signing.status)}>
                        {signing.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{signing.player.position}</Badge>
                      <Badge variant="secondary">OVR {signing.player.overall_rating}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Team:</span>
                        <span className="font-medium">{signing.team.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(signing.signing_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Contract:</span>
                        <span className="text-sm">{signing.contract_length} years</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm">{formatDate(signing.created_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4">
          {transfers.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">No completed transfers found</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {transfers.map((transfer) => (
                <Card key={transfer.id} className="fifa-card fifa-card-hover">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{transfer.player.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{transfer.player.position}</Badge>
                      <Badge variant="secondary">OVR {transfer.player.overall_rating}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">From:</span>
                        <span className="font-medium">{transfer.from_team.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">To:</span>
                        <span className="font-medium">{transfer.to_team.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(transfer.transfer_amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm">{formatDate(transfer.transfer_date)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
