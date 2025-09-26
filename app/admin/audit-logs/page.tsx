'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Search, Filter, X, RefreshCw } from 'lucide-react'
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { searchAuditLogs, getActionLabel, AuditLogResult } from "@/lib/audit/audit-log"
import HeaderBar from "@/components/admin/HeaderBar"
import FilterBar from "@/components/admin/FilterBar"

export default function AuditLogsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [logs, setLogs] = useState<AuditLogResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useState({
    searchText: '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    action: '',
    tableName: '',
    page: 1,
    pageSize: 20,
  })
  const [totalCount, setTotalCount] = useState(0)
  const [tableNames, setTableNames] = useState<string[]>([])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const { data, error, count } = await searchAuditLogs({
        searchText: searchParams.searchText || undefined,
        startDate: searchParams.startDate || undefined,
        endDate: searchParams.endDate || undefined,
        action: searchParams.action as any || undefined,
        tableName: searchParams.tableName || undefined,
        limit: searchParams.pageSize,
        offset: (searchParams.page - 1) * searchParams.pageSize,
      })

      if (error) throw error

      setLogs(data || [])
      setTotalCount(count || 0)
      
      // Extract unique table names for the filter
      if (data) {
        const tables = new Set(data.map((log: any) => log.table_name))
        setTableNames(Array.from(tables).filter(Boolean) as string[])
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [searchParams.page, searchParams.pageSize])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Reset to first page when searching
    setSearchParams(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const clearFilters = () => {
    setSearchParams({
      searchText: '',
      startDate: undefined,
      endDate: undefined,
      action: '',
      tableName: '',
      page: 1,
      pageSize: 20,
    })
  }

  const formatJson = (data: any) => {
    if (!data) return 'N/A'
    try {
      const parsed = typeof data === 'string' ? JSON.parse(data) : data
      return JSON.stringify(parsed, null, 2)
    } catch (e) {
      return String(data)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <HeaderBar
        title="Audit Logs"
        subtitle="View and filter system activity across tables."
        actions={
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter Logs</CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search logs..."
                  value={searchParams.searchText}
                  onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={searchParams.action}
                  onValueChange={(value) => setSearchParams({ ...searchParams, action: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Actions</SelectItem>
                    <SelectItem value="I">Created</SelectItem>
                    <SelectItem value="U">Updated</SelectItem>
                    <SelectItem value="D">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Table</label>
                <Select
                  value={searchParams.tableName}
                  onValueChange={(value) => setSearchParams({ ...searchParams, tableName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Tables" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Tables</SelectItem>
                    {tableNames.map((table) => (
                      <SelectItem key={table} value={table}>
                        {table}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <div className="flex space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !searchParams.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {searchParams.startDate ? format(searchParams.startDate, 'PPP') : <span>Start date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={searchParams.startDate}
                        onSelect={(date) => setSearchParams({ ...searchParams, startDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !searchParams.endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {searchParams.endDate ? format(searchParams.endDate, 'PPP') : <span>End date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={searchParams.endDate}
                        onSelect={(date) => setSearchParams({ ...searchParams, endDate: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Changes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.event_id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(log.action_timestamp), 'MMM d, yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.user_name || 'System'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          log.action === 'I' ? 'bg-green-100 text-green-800' :
                          log.action === 'U' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        )}>
                          {getActionLabel(log.action)}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {log.table_name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <div className="space-y-1">
                          {log.original_data && (
                            <div className="text-xs text-muted-foreground">
                              <strong>Old:</strong> {formatJson(log.original_data)}
                            </div>
                          )}
                          {log.new_data && (
                            <div className="text-xs">
                              <strong>New:</strong> {formatJson(log.new_data)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">
                  {(searchParams.page - 1) * searchParams.pageSize + 1}
                </span> to{' '}
                <span className="font-medium">
                  {Math.min(searchParams.page * searchParams.pageSize, totalCount)}
                </span> of{' '}
                <span className="font-medium">{totalCount}</span> logs
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchParams(prev => ({
                    ...prev,
                    page: Math.max(1, prev.page - 1)
                  }))}
                  disabled={searchParams.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchParams(prev => ({
                    ...prev,
                    page: prev.page + 1
                  }))}
                  disabled={searchParams.page * searchParams.pageSize >= totalCount || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
