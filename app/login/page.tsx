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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316a34a' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-teal-200/30 to-cyan-200/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        
        <div className="container mx-auto text-center relative z-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent leading-tight tracking-tight mb-6">
              Welcome Back to FIFA 26 League
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 leading-relaxed max-w-2xl mx-auto mb-12">
              Sign in to your FIFA 26 League account and get back to the action. 
              Access your profile, manage your club, and stay connected with the league.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center">
          <div className="bg-white/90 backdrop-blur-sm border border-emerald-200 rounded-2xl overflow-hidden w-full max-w-md shadow-xl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white text-xl font-bold">Sign In</h2>
                  <p className="text-emerald-100 text-sm">
                    Access your FIFA 26 League account
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6 p-6">
                {justRegistered && (
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Registration Successful</h3>
                        <p className="text-emerald-100 text-xs">
                          Your account has been created successfully. You can now log in.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {loginError && (
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Login Error</h3>
                        <p className="text-red-100 text-xs">{loginError}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    Email Address
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="your.email@example.com" 
                    {...register("email")} 
                    className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                  {errors.email && <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email.message}
                  </p>}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-teal-600" />
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    {...register("password")} 
                    className="border-2 border-emerald-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-300"
                  />
                  {errors.password && <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.password.message}
                  </p>}
                </div>
              </div>
              
              <div className="flex flex-col space-y-4 p-6 pt-0">
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold hover:scale-105 transition-all duration-200" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-sm text-emerald-600">
                    Don't have an account?{" "}
                    <Link 
                      href="/register" 
                      className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition-colors duration-200"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
