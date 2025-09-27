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
      <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
                <Camera className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Photo Gallery Management
              </h1>
              <p className="text-white/90 text-lg max-w-3xl mx-auto">
                Upload, organize, and manage photos for the league. Control carousel displays and team logos.
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-4xl mx-auto bg-white dark:bg-slate-800 border shadow-sm">
              <TabsTrigger 
                value="upload" 
                className="data-[state=active]:bg-pitch-blue-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Photos
              </TabsTrigger>
              <TabsTrigger 
                value="gallery"
                className="data-[state=active]:bg-stadium-gold-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <Images className="h-4 w-4" />
                Photo Gallery
              </TabsTrigger>
              <TabsTrigger 
                value="carousel"
                className="data-[state=active]:bg-field-green-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <Layout className="h-4 w-4" />
                Carousel
              </TabsTrigger>
              <TabsTrigger 
                value="logos"
                className="data-[state=active]:bg-goal-orange-500 data-[state=active]:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Team Logos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-pitch-blue-500 rounded-lg flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Photo Upload</h2>
                    <p className="text-slate-600 dark:text-slate-400">Upload new photos to the gallery</p>
                  </div>
                </div>
                <PhotoUploader />
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-stadium-gold-500 rounded-lg flex items-center justify-center">
                    <Images className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Photo Gallery</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage and organize uploaded photos</p>
                  </div>
                </div>
                <PhotoGallery />
              </div>
            </TabsContent>

            <TabsContent value="carousel" className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-field-green-500 rounded-lg flex items-center justify-center">
                    <Layout className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Homepage Carousel</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage the homepage image carousel</p>
                  </div>
                </div>
                <CarouselManager />
              </div>
            </TabsContent>

            <TabsContent value="logos" className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-goal-orange-500 rounded-lg flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Team Logos</h2>
                    <p className="text-slate-600 dark:text-slate-400">Manage team logos and branding</p>
                  </div>
                </div>
                <LogoManager />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminProtected>
  )
}