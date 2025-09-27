import { Suspense } from "react"
import { SimpleForumManagement } from "@/components/admin/simple-forum-management"
import { ErrorBoundary } from "@/components/error-boundary"
import { MessageSquare, Users, Shield, Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminForumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/30">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Forum Management</h1>
            <p className="text-white/90 text-lg max-w-3xl mx-auto">
              Comprehensive forum management and moderation tools for the league community. 
              Manage categories, posts, user interactions, and maintain a healthy discussion environment.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <Card className="w-full max-w-6xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <MessageSquare className="h-6 w-6" />
                Forum Management
              </CardTitle>
              <CardDescription>
                Comprehensive forum management and moderation tools for the league community. 
                Manage categories, posts, user interactions, and maintain a healthy discussion environment.
              </CardDescription>
            </CardHeader>
            <CardContent>
            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 border-pitch-blue-200 dark:border-pitch-blue-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-pitch-blue-800 dark:text-pitch-blue-200">Forum</div>
                      <div className="text-sm text-pitch-blue-600 dark:text-pitch-blue-400">Management</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 border-stadium-gold-200 dark:border-stadium-gold-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-stadium-gold-800 dark:text-stadium-gold-200">User</div>
                      <div className="text-sm text-stadium-gold-600 dark:text-stadium-gold-400">Moderation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-field-green-50 to-field-green-100 dark:from-field-green-900/20 dark:to-field-green-800/20 border-field-green-200 dark:border-field-green-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">Content</div>
                      <div className="text-sm text-field-green-600 dark:text-field-green-400">Moderation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-goal-orange-50 to-goal-orange-100 dark:from-goal-orange-900/20 dark:to-goal-orange-800/20 border-goal-orange-200 dark:border-goal-orange-700">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex items-center justify-center">
                      <Settings className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-goal-orange-800 dark:text-goal-orange-200">System</div>
                      <div className="text-sm text-goal-orange-600 dark:text-goal-orange-400">Settings</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <ErrorBoundary>
              <Suspense fallback={
                <div className="space-y-4">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              }>
                <SimpleForumManagement />
              </Suspense>
            </ErrorBoundary>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}