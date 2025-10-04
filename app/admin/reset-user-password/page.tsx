"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Container,
  Title,
  Text,
  Button,
  TextInput,
  Paper,
  Stack,
  Group,
  Card,
  ThemeIcon,
  Alert,
  Tabs,
  List,
  Table,
  Badge
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Key,
  Mail,
  Search,
  Send,
  AlertTriangle,
  CheckCircle,
  Shield,
  Lock,
  User,
  RefreshCw,
  UserCheck
} from "lucide-react"

interface UserSearchResult {
  id: string
  email: string
  gamer_tag_id: string
  last_sign_in_at?: string
  email_confirmed_at?: string
}

export default function ResetUserPasswordPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null)

  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter an email address or gamer tag to search",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSearching(true)
    try {
      const { data: users, error } = await supabase
        .from("users")
        .select("id, email, gamer_tag_id, last_sign_in_at, email_confirmed_at")
        .or(`email.ilike.%${searchTerm}%,gamer_tag_id.ilike.%${searchTerm}%`)
        .limit(10)

      if (error) throw error

      setSearchResults(users || [])

      if (users?.length === 0) {
        notifications.show({
          title: "No Results",
          message: "No users found matching your search",
          color: "orange"
        })
      }

    } catch (error: any) {
      console.error("Error searching users:", error)
      notifications.show({
        title: "Error",
        message: "Failed to search users",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSearching(false)
    }
  }

  const sendPasswordResetEmail = async (user: UserSearchResult) => {
    setIsProcessing(true)
    setSelectedUser(user)
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Password reset email sent to ${user.email}`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to send password reset email",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
      setSelectedUser(null)
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      searchUsers()
    }
  }

  return (
    <Container size="md" py="md" style={{ minHeight: '100vh', backgroundColor: 'var(--mantine-color-dark-9)' }}>
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-orange-6) 0%, var(--mantine-color-red-6) 100%)' }}>
        <Stack align="center" gap="md">
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <Key size={40} />
          </ThemeIcon>
          <Title order={1} c="cyan" ta="center">
            Reset User Password
          </Title>
          <Text size="lg" c="yellow" ta="center" maw={600}>
            Reset a user's password by email address - secure password recovery
          </Text>
        </Stack>
      </Paper>

      {/* Security Warning */}
      <Alert color="orange" variant="light" mb="lg">
        <Text fw={500}>Security Notice</Text>
        <Text size="sm" mt="xs">
          This tool sends secure password reset emails to users. The user will receive a link to reset their own password. 
          This is the recommended method for password recovery.
        </Text>
      </Alert>

      {/* Password Reset Tabs */}
      <Tabs defaultValue="search" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="search" leftSection={<Search size={16} />}>
            Find User
          </Tabs.Tab>
          <Tabs.Tab value="help" leftSection={<AlertTriangle size={16} />}>
            Help & Guidelines
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="search" pt="md">
          <Paper withBorder p="lg" bg="dark.7">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Search size={20} />
              </ThemeIcon>
              <Title order={4}>Search for User</Title>
            </Group>

            <Stack gap="md">
              <TextInput
                label="Email Address or Gamer Tag"
                placeholder="Enter user's email or gamer tag"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                leftSection={<User size={16} />}
                rightSection={
                  <Button 
                    size="xs" 
                    onClick={searchUsers}
                    loading={isSearching}
                    disabled={!searchTerm.trim()}
                  >
                    Search
                  </Button>
                }
                rightSectionWidth={80}
              />

              <Button 
                leftSection={<Search size={16} />}
                onClick={searchUsers}
                loading={isSearching}
                disabled={!searchTerm.trim()}
                fullWidth
              >
                Search Users
              </Button>
            </Stack>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Paper withBorder mt="lg" p="md">
                <Title order={5} mb="md">Search Results</Title>
                
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Action</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {searchResults.map((user) => (
                      <Table.Tr key={user.id}>
                        <Table.Td>
                          <Group>
                            <ThemeIcon color="blue" variant="light" size="sm">
                              <UserCheck size={16} />
                            </ThemeIcon>
                            <Text fw={500}>{user.gamer_tag_id}</Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{user.email}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {user.email_confirmed_at ? (
                              <Badge color="green" variant="light" size="sm">Verified</Badge>
                            ) : (
                              <Badge color="orange" variant="light" size="sm">Unverified</Badge>
                            )}
                            {user.last_sign_in_at && (
                              <Badge color="blue" variant="light" size="sm">Active</Badge>
                            )}
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Button
                            size="xs"
                            leftSection={<Send size={14} />}
                            onClick={() => sendPasswordResetEmail(user)}
                            loading={isProcessing && selectedUser?.id === user.id}
                            disabled={isProcessing}
                          >
                            Send Reset Email
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Paper>
            )}

            <Alert color="blue" variant="light" mt="md">
              <Text fw={500}>How it works:</Text>
              <List size="sm" mt="xs">
                <List.Item>Search for the user by email address or gamer tag</List.Item>
                <List.Item>Click "Send Reset Email" for the correct user</List.Item>
                <List.Item>User receives a secure password reset link via email</List.Item>
                <List.Item>User clicks the link and sets their new password</List.Item>
                <List.Item>Reset link expires after 1 hour for security</List.Item>
              </List>
            </Alert>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="help" pt="md">
          <Paper withBorder p="lg" bg="dark.7">
            <Group mb="md">
              <ThemeIcon color="orange" variant="light">
                <AlertTriangle size={20} />
              </ThemeIcon>
              <Title order={4}>Password Reset Guidelines</Title>
            </Group>

            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">When to use this tool:</Text>
                <List size="sm">
                  <List.Item>User forgot their password and requests help</List.Item>
                  <List.Item>User's account is locked due to failed login attempts</List.Item>
                  <List.Item>User reports they cannot access their account</List.Item>
                  <List.Item>User's email was compromised and needs password reset</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">Security features:</Text>
                <List size="sm">
                  <List.Item>Reset emails are sent directly to the user's registered email</List.Item>
                  <List.Item>Reset links expire after 1 hour</List.Item>
                  <List.Item>Links can only be used once</List.Item>
                  <List.Item>User must have access to their email to reset password</List.Item>
                  <List.Item>All password reset activities are logged</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">Best practices:</Text>
                <List size="sm">
                  <List.Item>Always verify the user's identity before sending reset emails</List.Item>
                  <List.Item>Confirm the email address is correct before sending</List.Item>
                  <List.Item>Inform the user to check their spam/junk folder</List.Item>
                  <List.Item>Document the reason for the password reset</List.Item>
                  <List.Item>Follow up to ensure the user successfully reset their password</List.Item>
                </List>
              </div>

              <Alert color="red" variant="light">
                <Text fw={500}>Important Security Notes</Text>
                <Text size="sm" mt="xs">
                  • Never reset passwords over the phone without proper verification
                  <br />
                  • Always use this secure email method rather than setting passwords directly
                  <br />
                  • If a user cannot access their email, escalate to senior admin for manual verification
                  <br />
                  • Monitor for suspicious password reset requests
                </Text>
              </Alert>

              <Alert color="blue" variant="light">
                <Text fw={500}>Troubleshooting</Text>
                <Text size="sm" mt="xs">
                  If users don't receive the reset email:
                  <br />
                  • Check if their email is verified in the system
                  <br />
                  • Ask them to check spam/junk folders
                  <br />
                  • Verify the email address is spelled correctly
                  <br />
                  • Wait a few minutes as emails may be delayed
                  <br />
                  • Try sending the email again if needed
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
