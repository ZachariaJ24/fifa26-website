"use client"

import React, { useState } from "react"
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
  Alert,
  Loader,
  ThemeIcon,
  Card,
  Divider
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  Loader2,
  AlertCircle,
  CheckCircle,
  Trash2,
  Shield,
  UserX,
  Database,
  Key,
  AlertTriangle
} from "lucide-react"

export default function CompleteUserDeletionPageMantine() {
  const [email, setEmail] = useState("")
  const [adminKey, setAdminKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!email) {
      setError("Email is required")
      return
    }

    if (!adminKey) {
      setError("Admin key is required")
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/admin/delete-user-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, adminKey }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user")
      }

      setResult(data)
      notifications.show({
        title: "User deleted",
        message: data.message,
        color: "green",
        icon: <CheckCircle size={16} />
      })
    } catch (error: any) {
      console.error("Error deleting user:", error)
      setError(error.message || "An error occurred")
      notifications.show({
        title: "Error",
        message: error.message || "Failed to delete user",
        color: "red",
        icon: <AlertCircle size={16} />
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container size="md" py="xl">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-red-6) 0%, var(--mantine-color-orange-6) 100%)' }}>
        <Group>
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <UserX size={40} />
          </ThemeIcon>
          <div>
            <Title order={1} c="white">
              Complete User Deletion
            </Title>
            <Text size="lg" c="white" opacity={0.9}>
              Permanently remove users from both Auth and Database systems
            </Text>
          </div>
        </Group>
      </Paper>

      <Stack gap="xl">
        {/* Warning Banner */}
        <Alert 
          icon={<AlertTriangle size={20} />} 
          color="red" 
          variant="light"
          styles={{
            root: { border: '2px solid var(--mantine-color-red-3)' }
          }}
        >
          <Text fw={600} size="lg" mb="xs">
            ⚠️ Irreversible Action Warning
          </Text>
          <Text size="sm">
            This action will completely and permanently remove a user from both the authentication system and database. 
            All user data, roles, team associations, and history will be permanently deleted. 
            <Text component="span" fw={700}>This action cannot be undone.</Text>
          </Text>
        </Alert>

        {/* Main Deletion Form */}
        <Paper withBorder shadow="md" p="xl">
          <Group mb="xl">
            <ThemeIcon size="lg" color="red" variant="light">
              <UserX size={24} />
            </ThemeIcon>
            <div>
              <Title order={2}>User Deletion Form</Title>
              <Text c="dimmed">Enter user email and admin verification key to proceed</Text>
            </div>
          </Group>

          <Stack gap="lg">
            {/* Error Alert */}
            {error && (
              <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
                <Text fw={600}>Error</Text>
                <Text size="sm">{error}</Text>
              </Alert>
            )}

            {/* Success Alert */}
            {result && (
              <Alert icon={<CheckCircle size={16} />} color="green" variant="light">
                <Text fw={600}>Success</Text>
                <Text size="sm" mb="md">{result.message}</Text>
                
                <Card withBorder p="md" bg="green.0">
                  <Group grow>
                    <Group gap="xs">
                      <Database size={16} />
                      <Text size="sm">
                        Database: <Text component="span" fw={600}>
                          {result.dbUserFound ? "Found & Deleted" : "Not Found"}
                        </Text>
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Shield size={16} />
                      <Text size="sm">
                        Auth System: <Text component="span" fw={600}>
                          {result.authUserFound ? "Found & Deleted" : "Not Found"}
                        </Text>
                      </Text>
                    </Group>
                  </Group>
                </Card>
              </Alert>
            )}

            {/* Email Input */}
            <div>
              <Group gap="xs" mb="xs">
                <UserX size={16} />
                <Text fw={500}>Email Address</Text>
              </Group>
              <TextInput
                type="email"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                size="lg"
                description="Enter the email address of the user you want to completely delete from the system."
              />
            </div>

            {/* Admin Key Input */}
            <div>
              <Group gap="xs" mb="xs">
                <Key size={16} />
                <Text fw={500}>Admin Verification Key</Text>
              </Group>
              <TextInput
                type="password"
                placeholder="Enter admin key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                size="lg"
                description="Enter your admin verification key to confirm this destructive action."
              />
            </div>

            <Divider />

            {/* Delete Button */}
            <Button
              onClick={handleDelete}
              disabled={isLoading || !email || !adminKey}
              color="red"
              size="lg"
              fullWidth
              leftSection={isLoading ? <Loader size={20} /> : <Trash2 size={20} />}
              loading={isLoading}
            >
              {isLoading ? "Deleting User..." : "Delete User Completely"}
            </Button>
          </Stack>
        </Paper>

        {/* Additional Information */}
        <Paper withBorder p="lg" bg="indigo.0">
          <Group mb="md">
            <ThemeIcon size="lg" color="indigo" variant="light">
              <Shield size={24} />
            </ThemeIcon>
            <Title order={3}>What Happens During Deletion?</Title>
          </Group>
          
          <Stack gap="xs">
            <Text size="sm">• User account is permanently removed from the authentication system</Text>
            <Text size="sm">• All user data is deleted from the database</Text>
            <Text size="sm">• User roles and permissions are completely removed</Text>
            <Text size="sm">• Team associations and player records are deleted</Text>
            <Text size="sm">• Forum posts, comments, and activity history are removed</Text>
            <Text size="sm">• All related records across all tables are permanently deleted</Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  )
}
