import { PageHeader } from "@/components/ui/page-header"
import { 
  AlertTriangle, 
  Shield, 
  Info, 
  ExternalLink, 
  FileText, 
  Users, 
  Trophy, 
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Zap,
  Heart,
  Award,
  BookOpen,
  Settings,
  MessageSquare,
  Mail
} from "lucide-react"

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Hero Header Section */}
      <div className="hockey-header relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="hockey-title mb-6">
              Legal Disclaimer
            </h1>
            <p className="hockey-subtitle mb-8">
              Important legal information about the FIFA 26 League
            </p>
            
            {/* Disclaimer Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="hockey-stat-item bg-gradient-to-br from-field-green-100 to-field-green-200 dark:from-field-green-900/30 dark:to-field-green-800/20">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg mb-3 mx-auto w-fit">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-field-green-700 dark:text-field-green-300">
                  Legal
                </div>
                <div className="text-xs text-field-green-600 dark:text-field-green-400 font-medium uppercase tracking-wide">
                  Protection
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-pitch-blue-100 to-pitch-blue-200 dark:from-pitch-blue-900/30 dark:to-pitch-blue-800/20">
                <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg mb-3 mx-auto w-fit">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300">
                  Important
                </div>
                <div className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 font-medium uppercase tracking-wide">
                  Notices
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-stadium-gold-100 to-stadium-gold-200 dark:from-stadium-gold-900/30 dark:to-stadium-gold-800/20">
                <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg mb-3 mx-auto w-fit">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-stadium-gold-700 dark:text-stadium-gold-300">
                  Terms &
                </div>
                <div className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 font-medium uppercase tracking-wide">
                  Conditions
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-goal-orange-100 to-goal-orange-200 dark:from-goal-orange-900/30 dark:to-goal-orange-800/20">
                <div className="p-2 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg mb-3 mx-auto w-fit">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-goal-orange-700 dark:text-goal-orange-300">
                  Third Party
                </div>
                <div className="text-xs text-goal-orange-600 dark:text-goal-orange-400 font-medium uppercase tracking-wide">
                  Services
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Important Notice */}
          <div className="fifa-card-hover-enhanced border-goal-orange-200/50 dark:border-goal-orange-700/50 bg-gradient-to-br from-goal-orange-50 to-goal-orange-100 dark:from-goal-orange-900/20 dark:to-goal-orange-800/20">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-goal-orange-800 dark:text-goal-orange-200 mb-3">
                    Important Legal Notice
                  </h2>
                  <p className="text-goal-orange-700 dark:text-goal-orange-300 leading-relaxed">
                    Please read this disclaimer carefully before using the FIFA 26 League website and services. By accessing or using our services, you agree to be bound by the terms and conditions outlined in this disclaimer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* No Affiliation Section */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  1. No Official Affiliation
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  The FIFA 26 League is an independent, community-driven organization and is not affiliated with, endorsed by, or sponsored by:
                </p>
                
                <div className="bg-gradient-to-r from-field-green-50 to-field-green-100 dark:from-field-green-900/20 dark:to-field-green-800/20 p-4 rounded-lg border-l-4 border-field-green-500">
                  <ul className="list-disc pl-6 space-y-2 text-field-green-700 dark:text-field-green-300">
                    <li>EA Sports or Electronic Arts Inc.</li>
                    <li>FIFA or the Fédération Internationale de Football Association</li>
                    <li>FIFA 26 or any official FIFA video game</li>
                    <li>Any professional football leagues or organizations</li>
                    <li>Any official gaming tournaments or competitions</li>
                  </ul>
                </div>
                
                <p className="leading-relaxed">
                  All trademarks, service marks, and trade names are the property of their respective owners. The use of any such marks does not imply endorsement or affiliation.
                </p>
              </div>
            </div>
          </div>

          {/* Service Disclaimer Section */}
          <div className="fifa-card-hover-enhanced border-pitch-blue-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-pitch-blue-50/50 dark:from-slate-900 dark:to-pitch-blue-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg">
                  <Info className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  2. Service Disclaimer
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                  <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">2.1 "As Is" Service</h4>
                  <p>The FIFA 26 League website and services are provided "as is" without any warranties, express or implied. We make no representations or warranties regarding the accuracy, reliability, or completeness of the information provided.</p>
                </div>
                
                <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                  <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">2.2 Service Availability</h4>
                  <p>We do not guarantee that our services will be available at all times. The website may be temporarily unavailable due to maintenance, technical issues, or other factors beyond our control.</p>
                </div>
                
                <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                  <h4 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">2.3 User-Generated Content</h4>
                  <p>We are not responsible for user-generated content, including but not limited to forum posts, comments, and user profiles. Users are solely responsible for their own content and interactions.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Limitation of Liability Section */}
          <div className="fifa-card-hover-enhanced border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-slate-900 dark:to-stadium-gold-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  3. Limitation of Liability
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  To the fullest extent permitted by law, the FIFA 26 League and its operators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or relating to:
                </p>
                
                <div className="bg-gradient-to-r from-stadium-gold-50 to-stadium-gold-100 dark:from-stadium-gold-900/20 dark:to-stadium-gold-800/20 p-4 rounded-lg border-l-4 border-stadium-gold-500">
                  <ul className="list-disc pl-6 space-y-1 text-stadium-gold-700 dark:text-stadium-gold-300">
                    <li>Use of our website or services</li>
                    <li>Inability to access or use our services</li>
                    <li>Any errors or omissions in our content</li>
                    <li>Any loss of data or information</li>
                    <li>Any interruption of service</li>
                    <li>Any damages resulting from third-party services</li>
                  </ul>
                </div>
                
                <p className="leading-relaxed">
                  This limitation of liability applies regardless of the legal theory on which the claim is based, whether in contract, tort, or otherwise.
                </p>
              </div>
            </div>
          </div>

          {/* Third-Party Services Section */}
          <div className="fifa-card-hover-enhanced border-goal-orange-200/50 dark:border-goal-orange-700/50 bg-gradient-to-br from-white to-goal-orange-50/50 dark:from-slate-900 dark:to-goal-orange-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg">
                  <ExternalLink className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  4. Third-Party Services
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  Our website may integrate with third-party services, including but not limited to:
                </p>
                
                <div className="bg-gradient-to-r from-goal-orange-50 to-goal-orange-100 dark:from-goal-orange-900/20 dark:to-goal-orange-800/20 p-4 rounded-lg border-l-4 border-goal-orange-500">
                  <ul className="list-disc pl-6 space-y-1 text-goal-orange-700 dark:text-goal-orange-300">
                    <li>Discord for community communication</li>
                    <li>Supabase for data storage and authentication</li>
                    <li>Vercel for website hosting</li>
                    <li>Various analytics and monitoring services</li>
                  </ul>
                </div>
                
                <p className="leading-relaxed">
                  We are not responsible for the privacy practices, terms of service, or content of these third-party services. Users should review the privacy policies and terms of service of any third-party services they interact with.
                </p>
              </div>
            </div>
          </div>

          {/* User Responsibilities Section */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  5. User Responsibilities
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  By using our services, you agree to:
                </p>
                
                <div className="bg-gradient-to-r from-field-green-50 to-field-green-100 dark:from-field-green-900/20 dark:to-field-green-800/20 p-4 rounded-lg border-l-4 border-field-green-500">
                  <ul className="list-disc pl-6 space-y-1 text-field-green-700 dark:text-field-green-300">
                    <li>Comply with all applicable laws and regulations</li>
                    <li>Respect the rights and privacy of other users</li>
                    <li>Not engage in any illegal or harmful activities</li>
                    <li>Not attempt to gain unauthorized access to our systems</li>
                    <li>Not use our services for any commercial purposes without permission</li>
                    <li>Report any violations of our terms of service</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Indemnification Section */}
          <div className="fifa-card-hover-enhanced border-pitch-blue-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-pitch-blue-50/50 dark:from-slate-900 dark:to-pitch-blue-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  6. Indemnification
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  You agree to indemnify and hold harmless the FIFA 26 League, its operators, and affiliates from any claims, damages, losses, or expenses (including reasonable attorney's fees) arising out of or relating to:
                </p>
                
                <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                  <ul className="list-disc pl-6 space-y-1 text-pitch-blue-700 dark:text-pitch-blue-300">
                    <li>Your use of our services</li>
                    <li>Your violation of these terms</li>
                    <li>Your violation of any third-party rights</li>
                    <li>Any content you submit or transmit through our services</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Governing Law Section */}
          <div className="fifa-card-hover-enhanced border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-slate-900 dark:to-stadium-gold-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  7. Governing Law and Jurisdiction
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  This disclaimer shall be governed by and construed in accordance with the laws of the jurisdiction in which the FIFA 26 League operates, without regard to conflict of law principles.
                </p>
                
                <p className="leading-relaxed">
                  Any disputes arising out of or relating to this disclaimer or our services shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.
                </p>
              </div>
            </div>
          </div>

          {/* Changes to Disclaimer Section */}
          <div className="fifa-card-hover-enhanced border-goal-orange-200/50 dark:border-goal-orange-700/50 bg-gradient-to-br from-white to-goal-orange-50/50 dark:from-slate-900 dark:to-goal-orange-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  8. Changes to This Disclaimer
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  We reserve the right to modify this disclaimer at any time. We will notify users of any material changes by posting the updated disclaimer on our website and updating the "Last Updated" date.
                </p>
                
                <p className="leading-relaxed">
                  Your continued use of our services after such changes constitutes acceptance of the updated disclaimer. If you do not agree to the changes, you must discontinue use of our services.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  9. Contact Information
                </h2>
              </div>
              
              <div className="space-y-4 text-slate-700 dark:text-slate-300">
                <p className="leading-relaxed">
                  If you have any questions about this disclaimer or our services, please contact us at:
                </p>
                
                <div className="bg-gradient-to-r from-field-green-50 to-field-green-100 dark:from-field-green-900/20 dark:to-field-green-800/20 p-6 rounded-lg border border-field-green-200 dark:border-field-green-700">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-field-green-600" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Email:</strong>{" "}
                        <a href="mailto:midnightstudiosintl@outlook.com" className="text-field-green-600 dark:text-field-green-400 hover:text-field-green-700 dark:hover:text-field-green-300 font-medium underline decoration-2 underline-offset-2 hover:decoration-field-green-500 transition-all duration-200">
                          midnightstudiosintl@outlook.com
                        </a>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-field-green-600" />
                      <p className="text-slate-700 dark:text-slate-300">
                        <strong>Discord:</strong>{" "}
                        <a
                          href="https://discord.gg/fifa26league"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-field-green-600 dark:text-field-green-400 hover:text-field-green-700 dark:hover:text-field-green-300 font-medium underline decoration-2 underline-offset-2 hover:decoration-field-green-500 transition-all duration-200"
                        >
                          FIFA 26 League Discord Server
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="fifa-card-hover-enhanced border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-800/20">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-slate-500 to-slate-600 rounded-lg">
                  <Info className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                  Last Updated: July 1, 2025
                </h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                This disclaimer is effective as of the date listed above and applies to all users of the FIFA 26 League website and services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}