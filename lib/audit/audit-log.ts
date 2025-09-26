import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/supabase"

export type AuditLogSearchParams = {
  searchText?: string
  startDate?: Date
  endDate?: Date
  userName?: string
  action?: 'I' | 'U' | 'D'
  tableName?: string
  limit?: number
  offset?: number
}

export type AuditLogResult = {
  event_id: number
  action_timestamp: string
  user_name: string | null
  action: 'I' | 'U' | 'D'
  schema_name: string
  table_name: string
  original_data: any
  new_data: any
  query: string | null
  total_count: number
}

export async function searchAuditLogs(params: AuditLogSearchParams = {}): Promise<{
  data: AuditLogResult[] | null
  error: Error | null
  count: number
}> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase.rpc('search_audit_logs', {
      p_search_text: params.searchText || null,
      p_start_date: params.startDate ? params.startDate.toISOString() : null,
      p_end_date: params.endDate ? params.endDate.toISOString() : null,
      p_user_name: params.userName || null,
      p_action: params.action || null,
      p_table_name: params.tableName || null,
      p_limit: params.limit || 100,
      p_offset: params.offset || 0
    })

    if (error) throw error

    return {
      data: data as unknown as AuditLogResult[],
      error: null,
      count: data?.[0]?.total_count || 0
    }
  } catch (error) {
    console.error('Error searching audit logs:', error)
    return {
      data: null,
      error: error as Error,
      count: 0
    }
  }
}

export async function logAdminAction(
  action: string,
  details: Record<string, any>,
  resourceType: string,
  resourceId?: string
) {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    await supabase.from('admin_actions').insert({
      user_id: user?.id || 'system',
      action,
      details,
      resource_type: resourceType,
      resource_id: resourceId,
      ip_address: '', // Will be set by a database trigger
      user_agent: ''  // Will be set by a database trigger
    })
  } catch (error) {
    console.error('Failed to log admin action:', error)
    // Fail silently to not disrupt the main operation
  }
}

// Helper function to get a user-friendly action label
export function getActionLabel(action: 'I' | 'U' | 'D'): string {
  switch (action) {
    case 'I': return 'Created'
    case 'U': return 'Updated'
    case 'D': return 'Deleted'
    default: return 'Modified'
  }
}
