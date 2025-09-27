"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PhotoGallery } from "@/components/admin/photo-gallery"
import { PhotoUploader } from "@/components/admin/photo-uploader"
import { CarouselManager } from "@/components/admin/carousel-manager"
import { LogoManager } from "@/components/admin/logo-manager"
import { AdminProtected } from "@/components/auth/admin-protected"
import { useSearchParams, useRouter } from "next/navigation"
import { Camera, Image, Upload, Images, Layout, Shield, Zap, Target, Database, Trophy, Star, Medal, Crown, Activity, Settings, Users } from "lucide-react"

export default function AdminPhotosPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("upload")

  // Initialize tab from URL on component mount
  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam && ["upload", "gallery", "carousel", "logos"].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)

    // Update URL with the new tab
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`/admin/photos?${params.toString()}`, { scroll: false })
  }

  return (
    <AdminProtected>
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
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-field-green-600 to-pitch-blue-600 bg-clip-text text-transparent mb-6">
                Photo Management Center
              </h1>
              <p className="text-lg text-slate-700 dark:text-slate-300 mx-auto mb-12 max-w-4xl">
                Comprehensive photo and media management for the league. 
                Upload, organize, and manage images, carousels, and team logos with professional tools.
              </p>
              
              {/* Enhanced Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto mb-16">
                <div className="group">
                  <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-field-green-500/25 transition-all duration-300">
                      <Upload className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Upload
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Photos
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-pitch-blue-500/25 transition-all duration-300">
                      <Images className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300 mb-2">
                      Photo
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Gallery
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-assist-green-500/25 transition-all duration-300">
                      <Layout className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-assist-green-700 dark:text-assist-green-300 mb-2">
                      Homepage
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      Carousel
                    </div>
                    <div className="w-16 h-1 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-full mx-auto mt-3 group-hover:w-20 transition-all duration-300"></div>
                  </div>
                </div>
                
                <div className="group">
                  <div className="hockey-stat-item hover:scale-110 transition-all duration-300 cursor-pointer">
                    <div className="w-16 h-16 bg-gradient-to-r from-goal-red-500 to-assist-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl group-hover:shadow-goal-red-500/25 transition-all duration-300">
                      <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold text-goal-red-700 dark:text-goal-red-300 mb-2">
                      Logo
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
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
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-4">
              Media Management Hub
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Manage all visual content for the league including photo uploads, gallery organization, 
              homepage carousel management, and team logo administration.
            </p>
          </div>

          {/* Enhanced Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-4xl mx-auto bg-gradient-to-r from-field-green-100 to-pitch-blue-100 dark:from-field-green-900/30 dark:to-pitch-blue-900/30 border-2 border-field-green-200 dark:border-field-green-700 p-2">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-field-green-500 data-[state=active]:to-pitch-blue-600 data-[state=active]:text-white hover:bg-field-green-200/50 dark:hover:bg-field-green-800/30 transition-all duration-300 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Photos
              </TabsTrigger>
              <TabsTrigger 
                value="gallery"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pitch-blue-500 data-[state=active]:to-field-green-600 data-[state=active]:text-white hover:bg-pitch-blue-200/50 dark:hover:bg-pitch-blue-800/30 transition-all duration-300 flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                Photo Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="carousel"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-assist-green-500 data-[state=active]:to-goal-red-600 data-[state=active]:text-white hover:bg-assist-green-200/50 dark:hover:bg-assist-green-800/30 transition-all duration-300 flex items-center gap-2"
              >
                <Layout className="h-4 w-4" />
                Homepage Carousel
              </TabsTrigger>
              <TabsTrigger 
                value="logos"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-goal-red-500 data-[state=active]:to-assist-green-600 data-[state=active]:text-white hover:bg-goal-red-200/50 dark:hover:bg-goal-red-800/30 transition-all duration-300 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Logo Management
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Tab Content */}
            <div className="space-y-8">
              <TabsContent value="upload" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Photo Upload Center
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Upload and manage photos for the league gallery and website content.
                  </p>
                </div>
                <PhotoUploader />
              </TabsContent>

              <TabsContent value="gallery" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-pitch-blue-500 to-field-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Images className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Photo Gallery Management
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Organize, categorize, and manage the league's photo collection.
                  </p>
                </div>
                <PhotoGallery />
              </TabsContent>

              <TabsContent value="carousel" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-assist-green-500 to-goal-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Layout className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Homepage Carousel Manager
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Manage the featured images displayed on the homepage carousel.
                  </p>
                </div>
                <CarouselManager />
              </TabsContent>

              <TabsContent value="logos" className="space-y-6">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-goal-red-500 to-assist-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Team Logo Management
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Upload and manage team logos and branding assets.
                  </p>
                </div>
                <LogoManager />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AdminProtected>
  )
}