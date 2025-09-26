import type { Metadata } from "next"
import UsersPage from "./UsersPage"

export const metadata: Metadata = {
  title: "User Management | SCS Admin",
  description: "Manage users in the SCS system",
}

export default function UsersManagementPage() {
  return <UsersPage />
}