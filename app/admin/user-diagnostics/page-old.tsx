import type { Metadata } from "next"
import UserDiagnostics from "@/components/admin/user-diagnostics"

export const metadata: Metadata = {
  title: "User Diagnostics",
  description: "Diagnose and fix user account issues",
}

export default function UserDiagnosticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white fifa-title">User Diagnostics</h1>
        <p className="text-lg text-white mb-8 fifa-subtitle max-w-4xl mx-auto">
          Use this tool to diagnose and fix issues with user accounts. You can look up users by email, check their
          verification status, and perform actions like sending verification emails or creating missing user records.
        </p>

        <UserDiagnostics />
      </div>
    </div>
  )
}
