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
  List
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Key,
  Mail,
  RefreshCw,
  Send,
  AlertTriangle,
  CheckCircle,
  Shield,
  Lock,
  User
} from "lucide-react"

export default function PasswordResetPageMantine() {
  const { supabase } = useSupabase()
  const { toast } = useToast()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sendPasswordResetEmail = async () => {
    if (!email.trim()) {
      notifications.show({
        title: "Error",
        message: "Please enter an email address",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Password reset email sent successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      setEmail("")

    } catch (error: any) {
      console.error("Error sending password reset email:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to send password reset email",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetPasswordDirectly = async () => {
    if (!userId.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      notifications.show({
        title: "Error",
        message: "Please fill in all fields",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    if (newPassword !== confirmPassword) {
      notifications.show({
        title: "Error",
        message: "Passwords do not match",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    if (newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "Password must be at least 6 characters long",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Update user password directly (admin privilege)
      const { error } = await supabase.auth.admin.updateUserById(userId.trim(), {
        password: newPassword
      })

      if (error) throw error

      notifications.show({
        title: "Success",
        message: "Password reset successfully",
        color: "green",
        icon: <CheckCircle size={16} />
      })

      setUserId("")
      setNewPassword("")
      setConfirmPassword("")

    } catch (error: any) {
      console.error("Error resetting password:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Failed to reset password",
        color: "red",
        icon: <AlertTriangle size={16} />
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Container size="md" py="md">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-red-6) 0%, var(--mantine-color-pink-6) 100%)' }}>
        <Stack align="center" gap="md">
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <Key size={40} />
          </ThemeIcon>
          <Title order={1} c="white" ta="center">
            Password Reset
          </Title>
          <Text size="lg" c="white" ta="center" maw={600}>
            Reset user passwords via email or direct admin override
          </Text>
        </Stack>
      </Paper>

      {/* Security Warning */}
      <Alert color="red" variant="light" mb="lg">
        <Text fw={500}>Security Notice</Text>
        <Text size="sm" mt="xs">
          This is a powerful administrative tool. Use with caution and ensure you have proper authorization 
          before resetting user passwords. All actions are logged for security purposes.
        </Text>
      </Alert>

      {/* Password Reset Methods */}
      <Tabs defaultValue="email" variant="outline">
        <Tabs.List grow>
          <Tabs.Tab value="email" leftSection={<Mail size={16} />}>
            Email Reset
          </Tabs.Tab>
          <Tabs.Tab value="direct" leftSection={<Shield size={16} />}>
            Direct Reset
          </Tabs.Tab>
          <Tabs.Tab value="help" leftSection={<AlertTriangle size={16} />}>
            Help & Guidelines
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="email" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="blue" variant="light">
                <Mail size={20} />
              </ThemeIcon>
              <Title order={4}>Send Password Reset Email</Title>
            </Group>

            <Text size="sm" c="dimmed" mb="md">
              Send a password reset email to the user. They will receive a secure link to reset their password.
            </Text>

            <Stack gap="md">
              <TextInput
                label="User Email Address"
                placeholder="Enter user's email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftSection={<Mail size={16} />}
                required
              />

              <Button 
                leftSection={<Send size={16} />}
                onClick={sendPasswordResetEmail}
                loading={isSubmitting}
                fullWidth
              >
                Send Password Reset Email
              </Button>
            </Stack>

            <Alert color="blue" variant="light" mt="md">
              <Text fw={500}>How it works:</Text>
              <List size="sm" mt="xs">
                <List.Item>User receives an email with a secure reset link</List.Item>
                <List.Item>Link expires after 1 hour for security</List.Item>
                <List.Item>User can set their own new password</List.Item>
                <List.Item>No admin intervention required after sending</List.Item>
              </List>
            </Alert>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="direct" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="red" variant="light">
                <Shield size={20} />
              </ThemeIcon>
              <Title order={4}>Direct Password Reset (Admin Only)</Title>
            </Group>

            <Alert color="red" variant="light" mb="md">
              <Text fw={500}>Administrative Override</Text>
              <Text size="sm">
                This method directly changes the user's password without their consent. 
                Use only in emergency situations or when explicitly requested by the user.
              </Text>
            </Alert>

            <Stack gap="md">
              <TextInput
                label="User ID"
                placeholder="Enter user's UUID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                leftSection={<User size={16} />}
                required
              />

              <TextInput
                label="New Password"
                placeholder="Enter new password (min 6 characters)"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftSection={<Lock size={16} />}
                required
              />

              <TextInput
                label="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftSection={<Lock size={16} />}
                required
              />

              <Button 
                leftSection={<Key size={16} />}
                onClick={resetPasswordDirectly}
                loading={isSubmitting}
                color="red"
                fullWidth
              >
                Reset Password Directly
              </Button>
            </Stack>

            <Alert color="orange" variant="light" mt="md">
              <Text fw={500}>Security Requirements:</Text>
              <List size="sm" mt="xs">
                <List.Item>Password must be at least 6 characters</List.Item>
                <List.Item>User ID must be a valid UUID</List.Item>
                <List.Item>Action is logged for audit purposes</List.Item>
                <List.Item>User will be notified of password change</List.Item>
              </List>
            </Alert>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="help" pt="md">
          <Paper withBorder p="lg">
            <Group mb="md">
              <ThemeIcon color="orange" variant="light">
                <AlertTriangle size={20} />
              </ThemeIcon>
              <Title order={4}>Password Reset Guidelines</Title>
            </Group>

            <Stack gap="md">
              <div>
                <Text fw={500} mb="xs">When to use Email Reset:</Text>
                <List size="sm">
                  <List.Item>User requests password reset</List.Item>
                  <List.Item>User has access to their email</List.Item>
                  <List.Item>Standard password recovery process</List.Item>
                  <List.Item>User can complete reset themselves</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">When to use Direct Reset:</Text>
                <List size="sm">
                  <List.Item>Emergency access required</List.Item>
                  <List.Item>User has lost access to email</List.Item>
                  <List.Item>Account recovery situations</List.Item>
                  <List.Item>Explicit user request with verification</List.Item>
                </List>
              </div>

              <div>
                <Text fw={500} mb="xs">Security Best Practices:</Text>
                <List size="sm">
                  <List.Item>Always verify user identity before direct reset</List.Item>
                  <List.Item>Use email reset when possible</List.Item>
                  <List.Item>Document reason for direct password changes</List.Item>
                  <List.Item>Inform user of password change immediately</List.Item>
                  <List.Item>Encourage user to change password again</List.Item>
                </List>
              </div>

              <Alert color="blue" variant="light">
                <Text fw={500}>Need Help?</Text>
                <Text size="sm">
                  If you're unsure about resetting a user's password, consult with your security team 
                  or follow your organization's password reset procedures.
                </Text>
              </Alert>
            </Stack>
          </Paper>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
