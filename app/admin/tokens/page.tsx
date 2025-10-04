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
  TextInput,
  NumberInput,
  Paper,
  Stack,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Modal,
  Card,
  ThemeIcon,
  ActionIcon,
  Menu,
  Alert
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import {
  Coins,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Gift
} from "lucide-react"

interface TokenTransaction {
  id: string
  user_id: string
  amount: number
  transaction_type: 'credit' | 'debit' | 'bonus' | 'penalty'
  description: string
  created_at: string
  user_gamer_tag: string
  current_balance: number
}

interface User {
  id: string
  gamer_tag_id: string
  token_balance: number
}

export default function TokensManagementPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Modals
  const [addTokensModalOpened, { open: openAddTokensModal, close: closeAddTokensModal }] = useDisclosure(false)
  const [removeTokensModalOpened, { open: openRemoveTokensModal, close: closeRemoveTokensModal }] = useDisclosure(false)
  
  // Form states
  const [tokenAmount, setTokenAmount] = useState<number | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch recent token transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("token_transactions")
        .select(`
          *,
          users!inner(gamer_tag_id)
        `)
        .order("created_at", { ascending: false })
        .limit(50)

      if (transactionsError) throw transactionsError

      const formattedTransactions = transactionsData?.map(transaction => ({
        id: transaction.id,
        user_id: transaction.user_id,
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        created_at: transaction.created_at,
        user_gamer_tag: transaction.users?.gamer_tag_id || 'Unknown User',
        current_balance: transaction.current_balance || 0
      })) || []

      setTransactions(formattedTransactions)

      // Fetch users with token balances
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, gamer_tag_id, token_balance")
        .order("token_balance", { ascending: false })
        .limit(20)

      if (usersError) throw usersError
      setUsers(usersData || [])

    } catch (error: any) {
      console.error("Error fetching data:", error)
      notifications.show({
        title: "Error",
        message: "Failed to load token data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTokens = (user: User) => {
    setSelectedUser(user)
    setTokenAmount(undefined)
    setDescription("")
    openAddTokensModal()
  }

  const handleRemoveTokens = (user: User) => {
    setSelectedUser(user)
    setTokenAmount(undefined)
    setDescription("")
    openRemoveTokensModal()
  }

  const processTokenTransaction = async (type: 'credit' | 'debit') => {
    if (!selectedUser || !tokenAmount || tokenAmount <= 0 || !description.trim()) {
      notifications.show({
        title: "Error",
        message: "Please fill in all required fields",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const amount = type === 'credit' ? tokenAmount : -tokenAmount
      const newBalance = selectedUser.token_balance + amount

      if (newBalance < 0) {
        notifications.show({
          title: "Error",
          message: "Insufficient token balance for this transaction",
          color: "red",
          icon: <AlertTriangle size={16} />
        })
        return
      }

      // Update user's token balance
      const { error: updateError } = await supabase
        .from("users")
        .update({ token_balance: newBalance })
        .eq("id", selectedUser.id)

      if (updateError) throw updateError

      // Record the transaction
      const { error: transactionError } = await supabase
        .from("token_transactions")
        .insert({
          user_id: selectedUser.id,
          amount: Math.abs(tokenAmount),
          transaction_type: type,
          description: description.trim(),
          current_balance: newBalance
        })

      if (transactionError) throw transactionError

      notifications.show({
        title: "Success",
        message: `Tokens ${type === 'credit' ? 'added' : 'removed'} successfully`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      closeAddTokensModal()
      closeRemoveTokensModal()
      setTokenAmount(undefined)
      setDescription("")
      fetchData()

    } catch (error: any) {
      console.error("Error processing token transaction:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to process token transaction",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getTransactionBadge = (type: string) => {
    const typeConfig: Record<string, { color: string; label: string; icon: any }> = {
      'credit': { color: 'green', label: 'Credit', icon: Plus },
      'debit': { color: 'red', label: 'Debit', icon: Trash2 },
      'bonus': { color: 'blue', label: 'Bonus', icon: Gift },
      'penalty': { color: 'orange', label: 'Penalty', icon: AlertTriangle }
    }

    const config = typeConfig[type] || { color: 'blue', label: type, icon: Coins }
    const IconComponent = config.icon
    
    return (
      <Badge 
        color={config.color} 
        variant="light" 
        size="sm"
        leftSection={<IconComponent size={12} />}
      >
        {config.label}
      </Badge>
    )
  }

  const getTotalTokens = () => {
    return users.reduce((sum, user) => sum + (user.token_balance || 0), 0)
  }

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="cyan">Loading Token Management...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-yellow-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <Coins size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="cyan">
                Token Management
              </Title>
              <Text size="lg" c="yellow" >
                Manage user tokens and transaction history
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="orange">{getTotalTokens().toLocaleString()}</Text>
              <Text size="sm" c="cyan">Total Tokens</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Token Overview</Title>
          <Button leftSection={<RefreshCw size={16} />} onClick={fetchData}>
            Refresh
          </Button>
        </Group>
      </Paper>

      {/* Statistics Cards */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{users.length}</Text>
          <Text size="sm" c="cyan">Active Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <TrendingUp size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">{transactions.length}</Text>
          <Text size="sm" c="cyan">Recent Transactions</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <DollarSign size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">
            {users.length > 0 ? Math.round(getTotalTokens() / users.length) : 0}
          </Text>
          <Text size="sm" c="cyan">Avg Balance</Text>
        </Card>
      </Group>

      {/* Top Users by Token Balance */}
      <Paper withBorder mb="lg">
        <Group justify="space-between" p="md">
          <Title order={4}>Top Token Holders</Title>
        </Group>
        
        <Table.ScrollContainer minWidth={600}>
          <Table verticalSpacing="sm" highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Rank</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>Token Balance</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user, index) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Badge variant="outline" size="sm">
                      #{index + 1}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <ThemeIcon color="blue" variant="light" size="sm">
                        <Users size={16} />
                      </ThemeIcon>
                      <Text fw={500}>{user.gamer_tag_id}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Group>
                      <Coins size={16} color="var(--mantine-color-yellow-6)" />
                      <Text fw={600} c="yellow">
                        {user.token_balance?.toLocaleString() || 0}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle">
                          <MoreHorizontal size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item 
                          leftSection={<Plus size={14} />}
                          color="green"
                          onClick={() => handleAddTokens(user)}
                        >
                          Add Tokens
                        </Menu.Item>
                        <Menu.Item 
                          leftSection={<Trash2 size={14} />}
                          color="red"
                          onClick={() => handleRemoveTokens(user)}
                        >
                          Remove Tokens
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Recent Transactions */}
      <Paper withBorder>
        <Group justify="space-between" p="md">
          <Title order={4}>Recent Transactions</Title>
        </Group>
        
        {transactions.length === 0 ? (
          <Center p="xl">
            <Stack align="center">
              <Coins size={48} stroke={1} color="var(--mantine-color-blue-5)" />
              <Text c="cyan">No token transactions found</Text>
            </Stack>
          </Center>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>User</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Date</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {transactions.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>
                      <Text fw={500}>{transaction.user_gamer_tag}</Text>
                    </Table.Td>
                    <Table.Td>
                      {getTransactionBadge(transaction.transaction_type)}
                    </Table.Td>
                    <Table.Td>
                      <Text 
                        fw={600} 
                        c={transaction.transaction_type === 'credit' || transaction.transaction_type === 'bonus' ? 'green' : 'red'}
                      >
                        {transaction.transaction_type === 'credit' || transaction.transaction_type === 'bonus' ? '+' : '-'}
                        {transaction.amount.toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" lineClamp={1}>{transaction.description}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>{transaction.current_balance.toLocaleString()}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="cyan">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Paper>

      {/* Add Tokens Modal */}
      <Modal opened={addTokensModalOpened} onClose={closeAddTokensModal} title="Add Tokens" size="md">
        {selectedUser && (
          <Stack>
            <Alert color="green" variant="light">
              <Text fw={500}>Adding tokens to {selectedUser.gamer_tag_id}</Text>
              <Text size="sm">Current balance: {selectedUser.token_balance?.toLocaleString() || 0} tokens</Text>
            </Alert>

            <NumberInput
              label="Token Amount"
              placeholder="Enter amount to add"
              value={tokenAmount}
              onChange={setTokenAmount}
              min={1}
              required
            />
            
            <TextInput
              label="Description"
              placeholder="Reason for adding tokens"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeAddTokensModal}>
                Cancel
              </Button>
              <Button 
                color="green"
                onClick={() => processTokenTransaction('credit')} 
                loading={isSubmitting}
              >
                Add Tokens
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Remove Tokens Modal */}
      <Modal opened={removeTokensModalOpened} onClose={closeRemoveTokensModal} title="Remove Tokens" size="md">
        {selectedUser && (
          <Stack>
            <Alert color="red" variant="light">
              <Text fw={500}>Removing tokens from {selectedUser.gamer_tag_id}</Text>
              <Text size="sm">Current balance: {selectedUser.token_balance?.toLocaleString() || 0} tokens</Text>
            </Alert>

            <NumberInput
              label="Token Amount"
              placeholder="Enter amount to remove"
              value={tokenAmount}
              onChange={setTokenAmount}
              min={1}
              max={selectedUser.token_balance || 0}
              required
            />
            
            <TextInput
              label="Description"
              placeholder="Reason for removing tokens"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeRemoveTokensModal}>
                Cancel
              </Button>
              <Button 
                color="red"
                onClick={() => processTokenTransaction('debit')} 
                loading={isSubmitting}
              >
                Remove Tokens
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
