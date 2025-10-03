import type { Metadata } from "next"
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  ThemeIcon
} from '@mantine/core'
import { Users } from "lucide-react"
import UserDiagnostics from "@/components/admin/user-diagnostics"

export const metadata: Metadata = {
  title: "User Diagnostics",
  description: "Diagnose and fix user account issues",
}

export default function UserDiagnosticsPageMantine() {
  return (
    <Container size="xl" py="xl">
      {/* Hero Header */}
      <Paper p="xl" mb="xl" style={{ background: 'linear-gradient(135deg, var(--mantine-color-green-6) 0%, var(--mantine-color-blue-6) 100%)' }}>
        <Stack align="center" gap="md">
          <ThemeIcon size={80} radius="xl" variant="light" color="white">
            <Users size={40} />
          </ThemeIcon>
          <Title order={1} c="white" ta="center">
            User Diagnostics
          </Title>
          <Text size="lg" c="white" ta="center" maw={600}>
            Use this tool to diagnose and fix issues with user accounts. You can look up users by email, check their
            verification status, and perform actions like sending verification emails or creating missing user records.
          </Text>
        </Stack>
      </Paper>

      <UserDiagnostics />
    </Container>
  )
}
