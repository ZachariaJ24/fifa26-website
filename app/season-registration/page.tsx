"use client"

import type React from "react"
import { useSupabase } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Loader2, Trophy, Calendar, Users, Star, Shield, Gamepad2, Clock, Target, Zap, CheckCircle2 } from "lucide-react"

export default function SeasonRegistrationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { supabase, session } = useSupabase()
  const [isLoading, setIsLoading] = useState(false)
  const [hasRegistered, setHasRegistered] = useState(false)
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(true)
  const [activeSeason, setActiveSeason] = useState<{ id: string; name: string; season_number?: number } | null>(null)
  const [loadingActiveSeason, setLoadingActiveSeason] = useState(true)
  const [debugInfo, setDebugInfo] = useState<string>("")

  // Form state
  const [gamerTag, setGamerTag] = useState("")
  const [primaryPosition, setPrimaryPosition] = useState("")
  const [secondaryPosition, setSecondaryPosition] = useState("none")
  const [consoleType, setConsoleType] = useState("")

  // Form validation
  const [errors, setErrors] = useState<{
    gamerTag?: string
    primaryPosition?: string
    consoleType?: string
  }>({})

  const fetchActiveSeason = async () => {
    try {
      setLoadingActiveSeason(true)

      // Try to get any active season directly from seasons table
      const { data: seasonData, error: seasonError } = await supabase
        .from("seasons")
        .select("id, name, season_number")
        .eq("is_active", true)
        .maybeSingle()

      if (seasonError) {
        window.console.error("Error fetching active season:", seasonError)
        setDebugInfo((prev) => prev + `\nError fetching active season: ${seasonError.message}`)
        
        // If no active season, try to get the first season
        const { data: firstSeason, error: firstSeasonError } = await supabase
          .from("seasons")
          .select("id, name, season_number")
          .order("id")
          .limit(1)
          .maybeSingle()

        if (firstSeasonError) {
          window.console.error("Error fetching first season:", firstSeasonError)
          setDebugInfo((prev) => prev + `\nError fetching first season: ${firstSeasonError.message}`)
          setLoadingActiveSeason(false)
          return null
        }

        setDebugInfo((prev) => prev + `\nUsing first season: ${JSON.stringify(firstSeason)}`)
        setActiveSeason(firstSeason)
        setLoadingActiveSeason(false)
        return firstSeason
      }

      setDebugInfo((prev) => prev + `\nFound active season: ${JSON.stringify(seasonData)}`)
      setActiveSeason(seasonData)
      setLoadingActiveSeason(false)
      return seasonData
    } catch (error) {
      window.console.error("Error in fetchActiveSeason:", error)
      setDebugInfo((prev) => prev + `\nUnhandled error: ${JSON.stringify(error)}`)
      setLoadingActiveSeason(false)
      return null
    }
  }

  useEffect(() => {
    // Check if user is authenticated
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for the season.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    // Fetch active season from system settings
    const fetchActiveSeasonData = async () => {
      setLoadingActiveSeason(true)
      try {
        const seasonData = await fetchActiveSeason()

        if (!seasonData) {
          setDebugInfo((prev) => prev + "\nNo active season found")
          toast({
            title: "No active season",
            description: "There is no active season available for registration.",
            variant: "destructive",
          })
          setLoadingActiveSeason(false)
          return
        }

        setActiveSeason(seasonData)
        setDebugInfo((prev) => prev + `\nActive season set to: ${JSON.stringify(seasonData)}`)
        setLoadingActiveSeason(false)

        // Check if user has already registered for this season
        checkRegistration(seasonData.season_number || 1)
      } catch (error) {
        window.console.error("Error in fetchActiveSeasonData:", error)
        setDebugInfo((prev) => prev + `\nUnhandled error: ${JSON.stringify(error)}`)
        setLoadingActiveSeason(false)
      }
    }

    fetchActiveSeasonData()
  }, [session, router, toast, supabase])

  // Check if user has already registered for the current season
  const checkRegistration = async (seasonNumber: number) => {
    if (!session?.user) return

    setIsCheckingRegistration(true)
    try {
      const { data, error } = await supabase
        .from("season_registrations")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("season_number", seasonNumber)
        .maybeSingle()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is the error code for "no rows returned"
        window.console.error("Error checking registration:", error)
        setDebugInfo((prev) => prev + `\nRegistration check error: ${error.message}`)
      }

      setHasRegistered(!!data)
      setDebugInfo((prev) => prev + `\nHas registered: ${!!data}`)
    } catch (error) {
      window.console.error("Error checking registration:", error)
      setDebugInfo((prev) => prev + `\nRegistration check exception: ${JSON.stringify(error)}`)
    } finally {
      setIsCheckingRegistration(false)
    }
  }

  const validateForm = () => {
    const newErrors: {
      gamerTag?: string
      primaryPosition?: string
      consoleType?: string
    } = {}

    if (!gamerTag || gamerTag.length < 3) {
      newErrors.gamerTag = "Gamer Tag must be at least 3 characters."
    }

    if (!primaryPosition) {
      newErrors.primaryPosition = "Please select a primary position."
    }

    if (!consoleType) {
      newErrors.consoleType = "Please select a console."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to register for the season.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    if (!activeSeason) {
      toast({
        title: "No active season",
        description: "There is no active season available for registration.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check again if user has already registered
      const { data: existingReg } = await supabase
        .from("season_registrations")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("season_number", activeSeason.season_number || 1)
        .maybeSingle()

      if (existingReg) {
        setHasRegistered(true)
        toast({
          title: "Already Registered",
          description:
            "Error: User is already signed up for the season. Please contact a League Official if you want to be removed from the season signup or change positions.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Prepare registration data
      // Use season_number if it exists, otherwise use derived_season_number or a default
      const seasonNumber = activeSeason.season_number || activeSeason.derived_season_number || 1

      const registrationData = {
        user_id: session.user.id,
        season_id: activeSeason.id,
        season_number: seasonNumber,
        primary_position: primaryPosition,
        secondary_position: secondaryPosition === "none" ? null : secondaryPosition,
        gamer_tag: gamerTag,
        console: consoleType,
        status: "Pending",
      }

      setDebugInfo((prev) => prev + `\nSubmitting registration: ${JSON.stringify(registrationData)}`)

      // Insert season registration
      const { error } = await supabase.from("season_registrations").insert(registrationData)

      if (error) {
        setDebugInfo((prev) => prev + `\nRegistration error: ${error.message}`)

        // Check if the error is due to the user already being registered
        if (error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
          setHasRegistered(true)
          throw new Error(
            "User is already signed up for the season. Please contact a League Official if you want to be removed from the season signup or change positions.",
          )
        }

        throw error
      }

      toast({
        title: "Registration successful!",
        description: `Your registration for ${activeSeason.name} has been submitted for review.`,
      })

      router.push("/profile")
    } catch (error: any) {
      setDebugInfo((prev) => prev + `\nRegistration exception: ${JSON.stringify(error)}`)
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user) {
      const checkBanStatus = async () => {
        try {
          // First try to get ban status with ban_expires_at column
          const { data: user, error } = await supabase
            .from("users")
            .select("is_banned, ban_reason, ban_expires_at")
            .eq("id", session.user.id)
            .maybeSingle()

          if (error) {
            // If ban_expires_at column doesn't exist, try without it
            if (error.message.includes("ban_expires_at") || error.code === "42703") {
              console.log("ban_expires_at column not found, trying without it")
              
              const { data: userFallback, error: fallbackError } = await supabase
                .from("users")
                .select("is_banned, ban_reason")
                .eq("id", session.user.id)
                .maybeSingle()

              if (fallbackError) {
                console.error("Error checking ban status (fallback):", fallbackError)
                // Don't show error toast for missing column, just log it
                return
              }

              if (userFallback?.is_banned) {
                toast({
                  title: "Account Suspended",
                  description: "Your account is currently suspended and you cannot register for the season.",
                  variant: "destructive",
                })
                router.push("/")
                return
              }
            } else {
              console.error("Error checking ban status:", error)
              // Don't show error toast for database issues, just log it
              return
            }
          } else if (user?.is_banned) {
            const isTemporaryBan = user.ban_expires_at && new Date(user.ban_expires_at) > new Date()

            toast({
              title: "Account Suspended",
              description: `Your account is currently suspended and you cannot register for the season. ${
                isTemporaryBan
                  ? `Suspension expires: ${new Date(user.ban_expires_at).toLocaleDateString()}`
                  : "This is a permanent suspension."
              }`,
              variant: "destructive",
            })
            router.push("/")
            return
          }
        } catch (error) {
          console.error("Error in checkBanStatus:", error)
          // Don't show error toast, just log it
        }
      }

      checkBanStatus()
    }
  }, [session, supabase, toast, router])

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Authentication Required</h2>
                    <p className="text-emerald-100 text-sm">
                      Please sign in to register for the season
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 text-center">
                <p className="text-emerald-700">Please sign in to register for the season.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (loadingActiveSeason || isCheckingRegistration) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-xl font-bold">Season Registration</h2>
                    <p className="text-emerald-100 text-sm">
                      Loading season information...
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-6 flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-4" />
                <p className="text-center text-emerald-700">Loading season information...</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  if (!activeSeason) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-white to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="hockey-enhanced-card">
              <CardHeader>
                <CardTitle className="text-3xl text-hockey-silver-900 dark:text-hockey-silver-100 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Season Registration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="hockey-enhanced-card border-goal-red-200 dark:border-goal-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-hockey-silver-900 dark:text-hockey-silver-100">No Active Season</AlertTitle>
                  <AlertDescription className="text-hockey-silver-700 dark:text-hockey-silver-300">
                    There is currently no active season available for registration. Please check back later.
                  </AlertDescription>
                </Alert>

                {process.env.NODE_ENV === "development" && (
                  <div className="mt-4 p-4 bg-hockey-silver-100 dark:bg-hockey-silver-800 rounded text-xs font-mono whitespace-pre-wrap">
                    <p className="font-bold text-hockey-silver-900 dark:text-hockey-silver-100">Debug Information:</p>
                    <p className="text-hockey-silver-700 dark:text-hockey-silver-300">{debugInfo || "No debug info available"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (hasRegistered) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ice-blue-50 via-white to-rink-blue-50 dark:from-hockey-silver-900 dark:via-hockey-silver-800 dark:to-rink-blue-900/30">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="hockey-enhanced-card">
              <CardHeader>
                <CardTitle className="text-3xl text-hockey-silver-900 dark:text-hockey-silver-100 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-ice-blue-500 to-rink-blue-600 rounded-lg">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  Season Registration
                </CardTitle>
                <CardDescription className="text-hockey-silver-600 dark:text-hockey-silver-400">
                  Your registration status for {activeSeason.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive" className="mb-6 hockey-enhanced-card border-goal-red-200 dark:border-goal-red-800">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-hockey-silver-900 dark:text-hockey-silver-100">Already Registered</AlertTitle>
                  <AlertDescription className="text-hockey-silver-700 dark:text-hockey-silver-300">
                    Error: User is already signed up for the season. Please contact a League Official if you want to be
                    removed from the season signup or change positions.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-center mt-4">
                  <Button onClick={() => router.push("/profile")} variant="outline" className="hockey-button-enhanced">
                    Return to Profile
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 border-t pt-6">
                <div className="text-sm text-hockey-silver-600 dark:text-hockey-silver-400">
                  Questions? Contact us on{" "}
                  <a
                    href="https://discord.gg/PnbwXuDf2A"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ice-blue-500 hover:text-ice-blue-600 hover:underline"
                  >
                    Discord
                  </a>
                  .
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 via-teal-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6">
              Season Registration
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 mb-8 max-w-3xl mx-auto">
              Register to participate in {activeSeason.name} of the FIFA 26 League.
            </p>
            <div className="flex justify-center gap-4">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <Trophy className="h-5 w-5 text-emerald-600" />
                <span className="text-emerald-800 font-semibold">{activeSeason.name}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-emerald-200 rounded-xl px-4 py-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                <span className="text-teal-800 font-semibold">Season {activeSeason.season_number || 1}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">{activeSeason.name} Registration</h2>
                  <p className="text-emerald-100 text-sm">
                    Register to participate for Season {activeSeason.season_number || 1} of the FIFA 26 League
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <h3 className="font-semibold mb-2 text-emerald-800 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  {activeSeason.name} Information
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-emerald-700">
                  <li>Registration Deadline: June 12, 2025</li>
                  <li>Bidding: June 13th 8PM Est - June 15th 2PM Est.</li>
                  <li>Preseason: June 18th-20th</li>
                  <li>Season Start Date: June 25th, 2025</li>
                  <li>Format: 60 regular season games</li>
                  <li>Games: Wednesday, Thursday, and Friday at 8:30, 9:10, 9:50 PM EST</li>
                  <li>Season Ends: August 8th, 2025</li>
                  <li>Playoffs: August 13th-Aug 29th 2025</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="gamerTag" className="text-emerald-800 font-semibold flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-emerald-600" />
                    Gamer Tag
                  </Label>
                  <Input
                    id="gamerTag"
                    placeholder="Your PSN or Xbox Gamertag"
                    value={gamerTag}
                    onChange={(e) => setGamerTag(e.target.value)}
                    className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                  <p className="text-sm text-emerald-600">This must match your gamer tag exactly.</p>
                  {errors.gamerTag && <p className="text-sm text-red-500">{errors.gamerTag}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="primaryPosition" className="text-emerald-800 font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4 text-emerald-600" />
                      Primary Position
                    </Label>
                    <Select onValueChange={setPrimaryPosition} value={primaryPosition}>
                      <SelectTrigger id="primaryPosition" className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300">
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ST">Striker (ST)</SelectItem>
                        <SelectItem value="CF">Center Forward (CF)</SelectItem>
                        <SelectItem value="LW">Left Winger (LW)</SelectItem>
                        <SelectItem value="RW">Right Winger (RW)</SelectItem>
                        <SelectItem value="CAM">Attacking Midfielder (CAM)</SelectItem>
                        <SelectItem value="CM">Central Midfielder (CM)</SelectItem>
                        <SelectItem value="CDM">Defensive Midfielder (CDM)</SelectItem>
                        <SelectItem value="LM">Left Midfielder (LM)</SelectItem>
                        <SelectItem value="RM">Right Midfielder (RM)</SelectItem>
                        <SelectItem value="CB">Center Back (CB)</SelectItem>
                        <SelectItem value="LB">Left Back (LB)</SelectItem>
                        <SelectItem value="RB">Right Back (RB)</SelectItem>
                        <SelectItem value="LWB">Left Wing Back (LWB)</SelectItem>
                        <SelectItem value="RWB">Right Wing Back (RWB)</SelectItem>
                        <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-emerald-600">Your preferred position to play.</p>
                    {errors.primaryPosition && <p className="text-sm text-red-500">{errors.primaryPosition}</p>}
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="secondaryPosition" className="text-emerald-800 font-semibold flex items-center gap-2">
                      <Target className="h-4 w-4 text-teal-600" />
                      Secondary Position
                    </Label>
                    <Select onValueChange={setSecondaryPosition} value={secondaryPosition}>
                      <SelectTrigger id="secondaryPosition" className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300">
                        <SelectValue placeholder="Select position (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="ST">Striker (ST)</SelectItem>
                        <SelectItem value="CF">Center Forward (CF)</SelectItem>
                        <SelectItem value="LW">Left Winger (LW)</SelectItem>
                        <SelectItem value="RW">Right Winger (RW)</SelectItem>
                        <SelectItem value="CAM">Attacking Midfielder (CAM)</SelectItem>
                        <SelectItem value="CM">Central Midfielder (CM)</SelectItem>
                        <SelectItem value="CDM">Defensive Midfielder (CDM)</SelectItem>
                        <SelectItem value="LM">Left Midfielder (LM)</SelectItem>
                        <SelectItem value="RM">Right Midfielder (RM)</SelectItem>
                        <SelectItem value="CB">Center Back (CB)</SelectItem>
                        <SelectItem value="LB">Left Back (LB)</SelectItem>
                        <SelectItem value="RB">Right Back (RB)</SelectItem>
                        <SelectItem value="LWB">Left Wing Back (LWB)</SelectItem>
                        <SelectItem value="RWB">Right Wing Back (RWB)</SelectItem>
                        <SelectItem value="GK">Goalkeeper (GK)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-emerald-600">Optional backup position.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="consoleType" className="text-emerald-800 font-semibold flex items-center gap-2">
                    <Gamepad2 className="h-4 w-4 text-emerald-600" />
                    Console
                  </Label>
                  <Select onValueChange={setConsoleType} value={consoleType}>
                    <SelectTrigger id="consoleType" className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300">
                      <SelectValue placeholder="Select console" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Xbox">Xbox</SelectItem>
                      <SelectItem value="PS5">PS5</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-emerald-600">Your gaming platform.</p>
                  {errors.consoleType && <p className="text-sm text-red-500">{errors.consoleType}</p>}
                </div>

                <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Submit Registration
                    </>
                  )}
                </Button>
              </form>

              {process.env.NODE_ENV === "development" && (
                <div className="mt-6 p-4 bg-emerald-50 rounded-xl text-xs font-mono whitespace-pre-wrap">
                  <p className="font-bold text-emerald-800">Debug Information:</p>
                  <p className="text-emerald-700">{debugInfo || "No debug info available"}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-4 p-6 pt-0 border-t border-emerald-200">
              <div className="text-sm text-emerald-600">
                By registering, you agree to abide by the league rules and code of conduct. All registrations are subject
                to review by league management. Key Requirement for the season: -Players must play 3 games a min of 3
                games a week.
              </div>
              <div className="text-sm">
                Questions? Contact us on{" "}
                <a
                  href="https://discord.gg/mghl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Discord
                </a>
                .
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
