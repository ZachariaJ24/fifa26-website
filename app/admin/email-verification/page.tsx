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
  Paper,
  Stack,
  Group,
  Badge,
  Table,
  Loader,
  Center,
  Card,
  ThemeIcon,
  Alert,
  Tabs,
  ActionIcon
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Mail,
  Shield,
  Users,
  RefreshCw,
  Search,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserCheck,
  MailCheck
} from "lucide-react"

interface UserVerification {
  id: string
  email: string
  gamer_tag_id: string
  email_confirmed_at: string | null
  created_at: string
  last_sign_in_at: string | null
  verification_status: 'verified' | 'unverified' | 'pending'
}

export default function EmailVerificationPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<UserVerification[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [emailToVerify, setEmailToVerify] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const { data: usersData, error } = await supabase
        .from("users")
        .select("id, email, gamer_tag_id, email_confirmed_at, created_at, last_sign_in_at")
        .order("created_at", { ascending: false })

      if (error) throw error

      const formattedUsers = usersData?.map(user => ({
        id: user.id,
        email: user.email,
        gamer_tag_id: user.gamer_tag_id,
        email_confirmed_at: user.email_confirmed_at,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        verification_status: user.email_confirmed_at ? 'verified' : 'unverified' as 'verified' | 'unverified' | 'pending'
      })) || []

      setUsers(formattedUsers)

    } catch (error: any) {
      console.error("Error fetching users:", error)
      notifications.show({
        title: "Error",
        message: "Failed to fetch user verification data",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setLoading(false)
    }
  }

  const sendVerificationEmail = async (email: string) => {
    setIsProcessing(true)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Verification email sent to ${email}`,
        color: "green",
        icon: <MailCheck size={16} />
      })

    } catch (error: any) {
      console.error("Error sending verification email:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to send verification email",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const manuallyVerifyUser = async (userId: string, email: string) => {
    setIsProcessing(true)
    try {
      // Update user's email_confirmed_at timestamp
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        email_confirm: true
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: `Manually verified ${email}`,
        color: "green",
        icon: <CheckCircle size={16} />
      })

      // Refresh the users list
      await fetchUsers()

    } catch (error: any) {
      console.error("Error manually verifying user:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to manually verify user",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const sendBulkVerificationEmails = async () => {
    const unverifiedUsers = users.filter(u => u.verification_status === 'unverified')
    
    if (unverifiedUsers.length === 0) {
      notifications.show({
        title: "No Action Needed",
        message: "All users are already verified",
        color: "blue"
      })
      return
    }

    setIsProcessing(true)
    let successCount = 0
    
    try {
      for (const user of unverifiedUsers) {
        try {
          await supabase.auth.resend({
            type: 'signup',
            email: user.email
          })
          successCount++
        } catch (error) {
          console.error(`Failed to send email to ${user.email}:`, error)
        }
      }

      notifications.show({
        title: "Bulk Email Complete",
        message: `Sent verification emails to ${successCount} out of ${unverifiedUsers.length} users`,
        color: successCount === unverifiedUsers.length ? "green" : "orange",
        icon: <MailCheck size={16} />
      })

    } catch (error: any) {
      console.error("Error sending bulk emails:", error)
      notifications.show({
        title: "Error",
        message: "Failed to send bulk verification emails",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.gamer_tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getVerificationBadge = (status: string) => {
    const config: Record<string, { color: string; label: string; icon: any }> = {
      'verified': { color: 'green', label: 'Verified', icon: CheckCircle },
      'unverified': { color: 'red', label: 'Unverified', icon: AlertTriangle },
      'pending': { color: 'yellow', label: 'Pending', icon: Clock }
    }

    const { color, label, icon: IconComponent } = config[status] || config['unverified']
    
    return (
      <Badge 
        color={color} 
        variant="light" 
        size="sm"
        leftSection={<IconComponent size={12} />}
      >
        {label}
      </Badge>
    )
  }

  const verifiedCount = users.filter(u => u.verification_status === 'verified').length
  const unverifiedCount = users.filter(u => u.verification_status === 'unverified').length

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Center h={400}>
          <Stack align="center">
            <Loader size="lg" />
            <Text c="dimmed">Loading Email Verification Data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)' }}>
        <Group justify="space-between">
          <Group>
            <ThemeIcon size={80} radius="xl" variant="light" color="white">
              <MailCheck size={40} />
            </ThemeIcon>
            <div>
              <Title order={1} c="white">
                Email Verification
              </Title>
              <Text size="lg" c="white" opacity={0.9}>
                Manage email verification for user accounts
              </Text>
            </div>
          </Group>
          <Card withBorder p="md" bg="white">
            <Stack gap="xs" align="center">
              <Text size="xl" fw={700} c="blue">{verifiedCount}</Text>
              <Text size="sm" c="dimmed">Verified Users</Text>
            </Stack>
          </Card>
        </Group>
      </Paper>

      {/* Actions */}
      <Paper withBorder p="md" mb="lg">
        <Group justify="space-between">
          <Title order={3}>Email Verification Management</Title>
          <Group>
            <Button leftSection={<RefreshCw size={16} />} onClick={fetchUsers}>
              Refresh
            </Button>
            <Button 
              leftSection={<Send size={16} />} 
              onClick={sendBulkVerificationEmails}
              loading={isProcessing}
              disabled={unverifiedCount === 0}
              color="blue"
            >
              Send Bulk Emails ({unverifiedCount})
            </Button>
          </Group>
        </Group>
      </Paper>

      {/* Statistics */}
      <Group mb="lg" grow>
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="green" variant="light" mx="auto" mb="md">
            <CheckCircle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="green">{verifiedCount}</Text>
          <Text size="sm" c="dimmed">Verified Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="red" variant="light" mx="auto" mb="md">
            <AlertTriangle size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="red">{unverifiedCount}</Text>
          <Text size="sm" c="dimmed">Unverified Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="blue" variant="light" mx="auto" mb="md">
            <Users size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="blue">{users.length}</Text>
          <Text size="sm" c="dimmed">Total Users</Text>
        </Card>
        
        <Card withBorder p="md" ta="center">
          <ThemeIcon size="lg" color="orange" variant="light" mx="auto" mb="md">
            <Shield size={24} />
          </ThemeIcon>
          <Text size="xl" fw={700} c="orange">
            {Math.round((verifiedCount / users.length) * 100) || 0}%
          </Text>
          <Text size="sm" c="dimmed">Verification Rate</Text>
        </Card>
      </Group>

      {/* Email Verification Tabs */}
      <Tabs defaultValue="users" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="users" leftSection={<Users size={16} />}>
            User Verification ({users.length})
          </Tabs.Tab>
          <Tabs.Tab value="send" leftSection={<Send size={16} />}>
            Send Verification
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="users" pt="md">
          <Paper withBorder>
            <Group justify="space-between" p="md">
              <Title order={4}>User Email Verification Status</Title>
            </Group>

            <Group p="md" pt={0}>
              <TextInput
                placeholder="Search by email or gamer tag..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftSection={<Search size={16} />}
                style={{ flex: 1 }}
              />
            </Group>

            {filteredUsers.length === 0 ? (
              <Center p="xl">
                <Stack align="center">
                  <Mail size={48} stroke={1} color="var(--mantine-color-gray-5)" />
                  <Text c="dimmed">
                    {searchTerm ? `No users match "${searchTerm}"` : "No users found"}
                  </Text>
                </Stack>
              </Center>
            ) : (
              <Table.ScrollContainer minWidth={900}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>User</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Verified Date</Table.Th>
                      <Table.Th>Last Sign In</Table.Th>
                      <Table.Th>Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredUsers.map((user) => (
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
                          {getVerificationBadge(user.verification_status)}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {user.email_confirmed_at 
                              ? new Date(user.email_confirmed_at).toLocaleDateString()
                              : 'Not verified'
                            }
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" c="dimmed">
                            {user.last_sign_in_at 
                              ? new Date(user.last_sign_in_at).toLocaleDateString()
                              : 'Never'
                            }
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              onClick={() => sendVerificationEmail(user.email)}
                              loading={isProcessing}
                              title="Send verification email"
                            >
                              <Send size={16} />
                            </ActionIcon>
                            
                            {user.verification_status === 'unverified' && (
                              <ActionIcon
                                variant="light"
                                color="green"
                                onClick={() => manuallyVerifyUser(user.id, user.email)}
                                loading={isProcessing}
                                title="Manually verify user"
                              >
                                <CheckCircle size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="send" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Send size={20} />
              </ThemeIcon>
              <Title order={4}>Send Verification Email</Title>
            </Group>

            <Stack gap="md">
              <Alert color="blue" variant="light">
                <Text fw={500}>Email Verification</Text>
                <Text size="sm" mt="xs">
                  Send verification emails to users who haven't verified their email addresses. 
                  Users will receive a secure link to verify their email.
                </Text>
              </Alert>

              <TextInput
                label="Email Address"
                placeholder="Enter user's email address"
                value={emailToVerify}
                onChange={(e) => setEmailToVerify(e.target.value)}
                leftSection={<Mail size={16} />}
              />

              <Group>
                <Button 
                  leftSection={<Send size={16} />}
                  onClick={() => {
                    if (emailToVerify.trim()) {
                      sendVerificationEmail(emailToVerify.trim())
                      setEmailToVerify("")
                    }
                  }}
                  loading={isProcessing}
                  disabled={!emailToVerify.trim()}
                >
                  Send Verification Email
                </Button>

                <Button 
                  leftSection={<MailCheck size={16} />}
                  onClick={sendBulkVerificationEmails}
                  loading={isProcessing}
                  disabled={unverifiedCount === 0}
                  variant="outline"
                >
                  Send to All Unverified ({unverifiedCount})
                </Button>
              </Group>

              <Alert color="orange" variant="light">
                <Text fw={500}>Important Notes</Text>
                <Text size="sm" mt="xs">
                  • Verification emails expire after 24 hours
                  • Users can request new verification emails from the login page
                  • Manual verification should only be used when email delivery fails
                  • Bulk emails are rate-limited to prevent spam
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
