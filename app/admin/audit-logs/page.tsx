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
import { createClient } from "@/lib/supabase/browser-client"

export default function AuditLogsPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [logs, setLogs] = useState<AuditLogResult[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeOn, setRealtimeOn] = useState(false)
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
  const supabase = createClient()

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

  // Realtime subscription to audit.logged_actions
  useEffect(() => {
    if (!realtimeOn) return
    const channel = supabase
      .channel('audit_logs_changes')
      .on('postgres_changes', { event: '*', schema: 'audit', table: 'logged_actions' }, () => {
        // Refresh current page when a new audit event occurs
        fetchLogs()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [realtimeOn])

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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setRealtimeOn(!realtimeOn)}>
              {realtimeOn ? 'Realtime: On' : 'Realtime: Off'}
            </Button>
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        }
      />

      {/* Standardized filter bar (transitional, before we remove the old card) */}
      <FilterBar onClear={clearFilters}>
        <div className="w-64">
          <Input
            type="search"
            placeholder="Search logs..."
            value={searchParams.searchText}
            onChange={(e) => setSearchParams({ ...searchParams, searchText: e.target.value })}
          />
        </div>
        <div className="w-44">
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
        <div className="w-56">
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
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.startDate ? format(searchParams.startDate, 'PPP') : 'Start date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchParams.startDate}
                onSelect={(date) => setSearchParams({ ...searchParams, startDate: date || undefined })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {searchParams.endDate ? format(searchParams.endDate, 'PPP') : 'End date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={searchParams.endDate}
                onSelect={(date) => setSearchParams({ ...searchParams, endDate: date || undefined })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={fetchLogs} disabled={loading}>
            <Search className="mr-2 h-4 w-4" />
            Apply
          </Button>
        </div>
      </FilterBar>


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
