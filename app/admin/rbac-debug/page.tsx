import { RbacDebugger } from "@/components/admin/rbac-debugger"
import { Shield, Users, Target, Database, Settings, CheckCircle, AlertTriangle, Lock, Key, Activity } from "lucide-react"

export default function RbacDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-field-green-800 dark:to-pitch-blue-900/30">
      {/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-hockey-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full "></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-assist-green-500/20 to-goal-red-500/20 rounded-full " style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-field-green-500/20 to-field-green-500/20 rounded-full " style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full shadow-2xl shadow-field-green-500/30">
              <Shield className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="hockey-title mb-4">
            RBAC Permission Debugger
          </h1>
          <p className="hockey-subtitle mb-8">
            Test and debug role-based access control permissions for match management
          </p>
          
          {/* Feature Highlights */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-gradient-to-r from-field-green-100/50 to-pitch-blue-100/50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 px-4 py-2 rounded-full border border-field-green-200/50 dark:border-pitch-blue-700/50">
              <Shield className="h-4 w-4 text-field-green-600 dark:text-field-green-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Permission Testing</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-assist-green-100/50 to-assist-green-100/50 dark:from-assist-green-900/20 dark:to-assist-green-900/20 px-4 py-2 rounded-full border border-assist-green-200/50 dark:border-assist-green-700/50">
              <Users className="h-4 w-4 text-assist-green-600 dark:text-assist-green-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">User Roles</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-pitch-blue-100/50 to-pitch-blue-100/50 dark:from-pitch-blue-900/20 dark:to-pitch-blue-900/20 px-4 py-2 rounded-full border border-pitch-blue-200/50 dark:border-pitch-blue-700/50">
              <Target className="h-4 w-4 text-pitch-blue-600 dark:text-pitch-blue-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Match Management</span>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-field-green-100/50 to-field-green-100/50 dark:from-field-green-900/20 dark:to-field-green-900/20 px-4 py-2 rounded-full border border-field-green-200/50 dark:border-field-green-700/50">
              <Database className="h-4 w-4 text-field-green-600 dark:text-field-green-400" />
              <span className="text-sm font-medium text-field-green-800 dark:text-field-green-200">Debug Tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-12">
        <RbacDebugger />
      </div>
    </div>
  )
}
