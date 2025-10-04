"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Container,
  Title,
  Text,
  Button,
  Paper,
  Stack,
  Group,
  Card,
  ThemeIcon,
  Loader,
  Center,
  Tabs,
  Table,
  Badge,
  Code,
  ScrollArea,
  Alert
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Database,
  Table as TableIcon,
  Key,
  Link,
  RefreshCw,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react"

interface TableInfo {
  table_name: string
  column_count: number
  row_count: number
  table_size: string
  columns: ColumnInfo[]
}

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  is_primary_key: boolean
  is_foreign_key: boolean
  foreign_table?: string
  foreign_column?: string
}

interface IndexInfo {
  index_name: string
  table_name: string
  column_names: string[]
  is_unique: boolean
  index_type: string
}

export default function DatabaseStructurePageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [indexes, setIndexes] = useState<IndexInfo[]>([])
  const [selectedTable, setSelectedTable] = useState<TableInfo | null>(null)

  useEffect(() => {
    fetchDatabaseStructure()
  }, [])

  const fetchDatabaseStructure = async () => {
    try {
      setLoading(true)
      
      // Get table information
      const { data: tablesData, error: tablesError } = await supabase
        .rpc('get_table_info')

      if (tablesError) {
        console.error("Error fetching tables:", tablesError)
        // Fallback to basic table list
        const { data: basicTables, error: basicError } = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')

        if (basicError) throw basicError
        
        const formattedTables = basicTables?.map(table => ({
          table_name: table.table_name,
          column_count: 0,
          row_count: 0,
          table_size: 'Unknown',
          columns: []
        })) || []
        
        setTables(formattedTables)
      } else {
        setTables(tablesData || [])
      }

      // Get index information
      const { data: indexesData, error: indexesError } = await supabase
        .rpc('get_index_info')

      if (indexesError) {
        console.error("Error fetching indexes:", indexesError)
        setIndexes([])
      } else {
        setIndexes(indexesData || [])
      }

    } catch (error: any) {
      console.error("Error fetching database structure:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch database structure. Some features may be limited.",
        color: "orange",
        icon: <AlertTriangle size={16} />
      })
      
      // Set minimal data to prevent crashes
      setTables([])
      setIndexes([])
    } finally {
      setLoading(false)
    }
  }

  const exportStructure = () => {
    const structureData = {
      tables: tables.map(table => ({
        name: table.table_name,
        columns: table.columns?.length || 0,
        rows: table.row_count,
        size: table.table_size
      })),
      indexes: indexes.map(index => ({
        name: index.index_name,
        table: index.table_name,
        columns: index.column_names,
        unique: index.is_unique
      })),
      exported_at: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(structureData, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `database-structure-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    window.URL.revokeObjectURL(url)

    notifications.show({
      title: "Success",
      message: "Database structure exported successfully",
      color: "green",
      icon: <CheckCircle size={16} />
    })
  }

  if (loading) {
    return (
      <Container size="xl" py="xl" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Database Structure...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-indigo-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Database size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Database Structure
              </Title>
              <Text size="lg" c="yellow" >
                View and analyze database schema, tables, and indexes
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="dark.6">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="cyan">{tables.length}</Text>
              <Text size="sm" c="cyan">Tables</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Database Overview</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchDatabaseStructure}>
              Refresh
            </Button>
            <Button leftSection={<Download size={16} />} onClick={exportStructure} variant="outline">
              Export Structure
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Info Alert */}
      <Alert color="blue" variant="light" mb="lg">
        <Text fw={500}>Database Structure Analysis</Text>
        <Text size="sm" mt="xs">
          This tool provides an overview of your database schema including tables, columns, indexes, and relationships. 
          Use this for development, debugging, and documentation purposes.
        </Text>
      </Alert>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <TableIcon size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{tables.length}</Text>
          <Text size="sm" c="cyan">Tables</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <Key size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">
            {tables.reduce((sum, table) => sum + (table.columns?.length || 0), 0)}
          </Text>
          <Text size="sm" c="cyan">Columns</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Link size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">{indexes.length}</Text>
          <Text size="sm" c="cyan">Indexes</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="purple" variant="light" mx="auto" mb="md">
            <Database size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="purple">
            {tables.reduce((sum, table) => sum + (table.row_count || 0), 0).toLocaleString()}
          </Text>
          <Text size="sm" c="cyan">Total Rows</Text>
        </Card>
      </Group>

      {/* Database Structure Tabs */}
      <Tabs defaultValue="tables" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="tables" leftSection={<TableIcon size={16} />}>
            Tables ({tables.length})
          </Tabs.Tab>
          <Tabs.Tab value="indexes" leftSection={<Key size={16} />}>
            Indexes ({indexes.length})
          </Tabs.Tab>
          <Tabs.Tab value="relationships" leftSection={<Link size={16} />}>
            Relationships
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="tables" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Database Tables</Title>
            </Group>

            {tables.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <TableIcon size={48} stroke={1} color="var(--mantine-color-indigo-5)" />
                  <Text c="cyan">No tables found or unable to fetch table information</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={800}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Table Name</Table.Th>
                      <Table.Th>Columns</Table.Th>
                      <Table.Th>Rows</Table.Th>
                      <Table.Th>Size</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {tables.map((table) => (
                      <Table.Tr key={table.table_name}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon color="blue" variant="light" size="sm">
                              <TableIcon size={16} />
                            </ThemeIcon>
                            <Code fw={500}>{table.table_name}</Code>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" size="sm">
                            {table.column_count || table.columns?.length || 0}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{(table.row_count || 0).toLocaleString()}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{table.table_size || 'Unknown'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            variant="light"
                            leftSection={<Eye size={14} />}
                            onClick={() => setSelectedTable(table)}
                          >
                            View Schema
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>

          {/* Table Details Modal */}
          {selectedTable && (
            <Paper withBorder mt="lg" p="lg">
              <Group justify="space-between" mb="md">
                <Title order={4}>Table: {selectedTable.table_name}</Title>
                <Button size="xs" variant="outline" onClick={() => setSelectedTable(null)}>
                  Close
                </Button>
              </Group>

              {selectedTable.columns && selectedTable.columns.length > 0 ? (
                <ScrollArea h={400}>
                  <Table verticalSpacing="xs" fontSize="sm">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Column</Table.Th>
                        <Table.Th>Type</Table.Th>
                        <Table.Th>Nullable</Table.Th>
                        <Table.Th>Default</Table.Th>
                        <Table.Th>Constraints</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {selectedTable.columns.map((column) => (
                        <Table.Tr key={column.column_name}>
                          <Table.Td>
                            <Code size="sm">{column.column_name}</Code>
                          </Table.Td>
                          <Table.Td>
                            <Badge variant="outline" size="xs">
                              {column.data_type}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c={column.is_nullable === 'YES' ? 'orange' : 'green'}>
                              {column.is_nullable === 'YES' ? 'Yes' : 'No'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text size="xs" c="cyan">
                              {column.column_default || '-'}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs">
                              {column.is_primary_key && (
                                <Badge color="blue" size="xs">PK</Badge>
                              )}
                              {column.is_foreign_key && (
                                <Badge color="orange" size="xs">FK</Badge>
                              )}
                            </Group>
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </ScrollArea>
              ) : (
                <Text c="cyan">Column information not available</Text>
              )}
            </Paper>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="indexes" pt="md">
          <Paper withBorder bg="dark.7">
            <Group justify="space-between" p="md">
              <Title order={4}>Database Indexes</Title>
            </Group>

            {indexes.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Key size={48} stroke={1} color="var(--mantine-color-indigo-5)" />
                  <Text c="cyan">No indexes found or unable to fetch index information</Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={600}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Index Name</Table.Th>
                      <Table.Th>Table</Table.Th>
                      <Table.Th>Columns</Table.Th>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Unique</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {indexes.map((index) => (
                      <Table.Tr key={`${index.table_name}-${index.index_name}`}>
                        <Table.Td>
                          <Code size="sm">{index.index_name}</Code>
                        </Table.Td>
                        <Table.Td>
                          <Code size="sm">{index.table_name}</Code>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{index.column_names?.join(', ') || 'Unknown'}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="outline" size="sm">
                            {index.index_type || 'btree'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={index.is_unique ? 'green' : 'indigo'} 
                            variant="light" 
                            size="sm"
                          >
                            {index.is_unique ? 'Yes' : 'No'}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="relationships" pt="md">
          <Paper withBorder p="lg" bg="dark.7">
            <Group mb="md">
              <ThemeIcon color="orange" variant="light">
                <Link size={20} />
              </ThemeIcon>
              <Title order={4}>Foreign Key Relationships</Title>
            </Group>

            <Alert color="blue" variant="light">
              <Text fw={500}>Relationship Analysis</Text>
              <Text size="sm" mt="xs">
                Foreign key relationships help maintain data integrity and define how tables are connected. 
                This information is extracted from the database schema.
              </Text>
            </Alert>

            {/* This would require a more complex query to get FK relationships */}
            <Center p="xl">
              <Stack align="center">
                <Info size={48} stroke={1} color="var(--mantine-color-blue-5)" />
                <Text c="blue" fw={500}>Relationship analysis available</Text>
                <Text c="cyan" size="sm" ta="center">
                  Foreign key relationships are defined in the database schema. 
                  Check individual table details for FK information.
                </Text>
              </Stack>
            </Center>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
