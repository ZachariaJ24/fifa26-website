import { FixConsoleValues } from "@/components/admin/fix-console-values"
// import { motion } from "framer-motion"
import { Wrench } from "lucide-react"

export default function FixConsoleValuesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="">
            <div className="mb-8 text-center">
              <h1 className="hockey-title-enhanced mb-4 flex items-center justify-center gap-3">
                <div className="hockey-feature-icon">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                Fix Console Values
              </h1>
              <p className="hockey-subtitle-enhanced">
                Fix console constraint violations for users that failed to be created in the database with intelligent repair
              </p>
              <div className="hockey-section-divider mt-6"></div>
            </div>

            <FixConsoleValues />
          </div>
        </div>
      </div>
    </div>
  )
}
