"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import Link from "next/link"
import { Loader2, AlertCircle, CheckCircle2, Trophy, Medal, Target, Zap, Shield, Database, Activity, TrendingUp, Users, Settings, BarChart3, Clock, Calendar, FileText, BookOpen, Globe, Publish, AlertTriangle, CheckCircle, Edit, Save, Award, Crown, Gamepad2, Play, Pause, Stop, Eye, EyeOff, Filter, Search, Download, Upload, Info, LogIn, User, Lock, Mail, Key, ArrowRight, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

// Define the form schema with Zod
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

type FormValues = z.infer<typeof formSchema>

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [justRegistered, setJustRegistered] = useState(false)

  // Check for registered=true query parameter
  useEffect(() => {
    if (searchParams?.get("registered") === "true") {
      setJustRegistered(true)
    }
  }, [searchParams])

  // Initialize form with react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    if (!supabase) {
      toast({
        title: "Error",
        description: "Unable to connect to authentication service",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setLoginError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      // Success
      toast({
        title: "Login successful",
        description: "Welcome back!",
      })

      // Redirect to home page
      router.push("/")
    } catch (error: any) {
      console.error("Login error:", error)
      setLoginError(error.message || "An error occurred during login")

      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900 fifa-scrollbar">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-fifa-pattern opacity-5"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-field-green-200/30 to-pitch-blue-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-stadium-gold-200/30 to-goal-orange-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              Welcome Back to FIFA 26 League
            </h1>
            <p className="text-xl md:text-2xl text-field-green-700 dark:text-field-green-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Sign in to your FIFA 26 League account and get back to the action. 
              Access your profile, manage your team, and stay connected with the league.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <Card className="fifa-card-hover-enhanced border-2 border-field-green-200/60 dark:border-field-green-700/60 overflow-hidden shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-field-green-500 to-pitch-blue-600 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20" />
                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <LogIn className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl font-bold">Sign In</CardTitle>
                    <CardDescription className="text-field-green-100 text-base">
                      Access your FIFA 26 League account
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-6 p-6">
                  {justRegistered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="fifa-card-hover-enhanced border-2 border-stadium-gold-200/60 dark:border-stadium-gold-700/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 text-white p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">Registration Successful</h3>
                              <p className="text-stadium-gold-100 text-xs">
                                Your account has been created successfully. You can now log in.
                              </p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  {loginError && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="fifa-card-hover-enhanced border-2 border-goal-orange-200/60 dark:border-goal-orange-700/60 overflow-hidden">
                        <div className="bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 text-white p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-semibold text-white">Login Error</h3>
                              <p className="text-goal-orange-100 text-xs">{loginError}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <Label htmlFor="email" className="text-base font-semibold text-field-green-700 dark:text-field-green-300 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-field-green-600" />
                      Email Address
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      {...register("email")} 
                      className="fifa-search border-2 focus:border-field-green-500 dark:focus:border-pitch-blue-500 focus:ring-4 focus:ring-field-green-500/20 dark:focus:ring-pitch-blue-500/20 transition-all duration-300"
                    />
                    {errors.email && <p className="text-sm text-goal-orange-600 dark:text-goal-orange-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email.message}
                    </p>}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-base font-semibold text-field-green-700 dark:text-field-green-300 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-pitch-blue-600" />
                        Password
                      </Label>
                      <Link href="/forgot-password" className="text-sm text-field-green-600 hover:text-field-green-700 dark:text-field-green-400 dark:hover:text-field-green-300 hover:underline transition-colors duration-200">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      {...register("password")} 
                      className="fifa-search border-2 focus:border-field-green-500 dark:focus:border-pitch-blue-500 focus:ring-4 focus:ring-field-green-500/20 dark:focus:ring-pitch-blue-500/20 transition-all duration-300"
                    />
                    {errors.password && <p className="text-sm text-goal-orange-600 dark:text-goal-orange-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password.message}
                    </p>}
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4 p-6 pt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full fifa-button-enhanced text-lg py-3" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn className="mr-3 h-6 w-6" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="text-center"
                  >
                    <p className="text-lg text-field-green-600 dark:text-field-green-400">
                      Don't have an account?{" "}
                      <Link 
                        href="/register" 
                        className="text-field-green-600 hover:text-field-green-700 dark:text-field-green-400 dark:hover:text-field-green-300 font-semibold hover:underline transition-colors duration-200"
                      >
                        Create Account
                      </Link>
                    </p>
                  </motion.div>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}