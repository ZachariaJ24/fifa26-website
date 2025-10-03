"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Eye, Plus, Trash2, Newspaper, Calendar, Trophy, Star, Medal, Crown, Activity, TrendingUp, Users, Target, Zap, Shield, Database, Settings, BarChart3, Clock, Award, BookOpen, FileText, Globe, Send } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AdminNewsPage() {
  const router = useRouter()
  const { supabase, session } = useSupabase()
  const { toast } = useToast()
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Check if user is authenticated and has admin privileges
    if (!session) {
      toast({
        title: "Unauthorized",
        description: "You must be logged in to access this page.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    fetchArticles()
  }, [session])

  const fetchArticles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("news_articles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching articles:", error)
        toast({
          title: "Error",
          description: "Failed to fetch news articles.",
          variant: "destructive",
        })
        return
      }

      setArticles(data || [])
    } catch (error) {
      console.error("Error fetching articles:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (articleId: string) => {
    try {
      const { error } = await supabase
        .from("news_articles")
        .delete()
        .eq("id", articleId)

      if (error) {
        console.error("Error deleting article:", error)
        toast({
          title: "Error",
          description: "Failed to delete article.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Article deleted successfully.",
      })

      // Refresh articles
      await fetchArticles()
    } catch (error) {
      console.error("Error deleting article:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setArticleToDelete(null)
    }
  }

  const filteredArticles = articles.filter((article) => {
    if (filter === "all") return true
    if (filter === "published") return article.published
    if (filter === "draft") return !article.published
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      {/* Header */}
      <div className="bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 shadow-lg border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <Newspaper className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">News Management</h1>
                <p className="text-white/90 text-lg">Manage news articles and announcements</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={fetchArticles} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button asChild className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Link href="/admin/news/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Article
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-field-green-600 dark:text-field-green-400">Total Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-field-green-800 dark:text-field-green-200">{articles.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-field-green-600 dark:text-field-green-400">Published</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-field-green-600">{articles.filter(a => a.published).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-field-green-600 dark:text-field-green-400">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-goal-orange-600">{articles.filter(a => !a.published).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-field-green-800 dark:text-field-green-200">All Articles</CardTitle>
                <CardDescription className="text-field-green-600 dark:text-field-green-400">
                  Manage your news articles and announcements
                </CardDescription>
              </div>
              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="bg-white dark:bg-slate-800 border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-pitch-blue-500 data-[state=active]:text-white">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="published" className="data-[state=active]:bg-field-green-500 data-[state=active]:text-white">
                    Published
                  </TabsTrigger>
                  <TabsTrigger value="draft" className="data-[state=active]:bg-goal-orange-500 data-[state=active]:text-white">
                    Drafts
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-[300px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-12">
                <Newspaper className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-field-green-800 dark:text-field-green-200 mb-2">No articles found</h3>
                <p className="text-field-green-600 dark:text-field-green-400 mb-4">
                  {filter === "all" ? "No articles have been created yet." : 
                   filter === "published" ? "No published articles found." : 
                   "No draft articles found."}
                </p>
                <Button asChild>
                  <Link href="/admin/news/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Article
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-field-green-600 dark:text-field-green-400">Title</TableHead>
                      <TableHead className="text-field-green-600 dark:text-field-green-400">Status</TableHead>
                      <TableHead className="text-field-green-600 dark:text-field-green-400">Author</TableHead>
                      <TableHead className="text-field-green-600 dark:text-field-green-400">Created</TableHead>
                      <TableHead className="text-field-green-600 dark:text-field-green-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="font-medium text-field-green-800 dark:text-field-green-200">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant={article.published ? "default" : "secondary"} className={article.published ? "bg-field-green-500" : "bg-goal-orange-500"}>
                            {article.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-field-green-600 dark:text-field-green-400">
                          {article.author || "Unknown"}
                        </TableCell>
                        <TableCell className="text-field-green-600 dark:text-field-green-400">
                          {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/news/${article.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/admin/news/${article.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setArticleToDelete(article.id)
                                setDeleteDialogOpen(true)
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => articleToDelete && handleDelete(articleToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}