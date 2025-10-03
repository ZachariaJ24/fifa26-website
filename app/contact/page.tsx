"use client"

import { useState } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Mail, 
  MessageSquare, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle, 
  AlertCircle,
  Users,
  Trophy,
  Target,
  Star,
  Zap,
  Heart,
  Award,
  BookOpen,
  Settings,
  Info,
  ExternalLink
} from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitStatus('success')
    setIsSubmitting(false)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30">
      {/* Hero Header Section */}
      <div className="hockey-header relative py-16 px-4">
        <div className="container mx-auto text-center">
          <div>
            <h1 className="hockey-title mb-6">
              Contact Us
            </h1>
            <p className="hockey-subtitle mb-8">
              Get in touch with the FIFA 26 League team
            </p>
            
            {/* Contact Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              <div className="hockey-stat-item bg-gradient-to-br from-field-green-100 to-field-green-200 dark:from-field-green-900/30 dark:to-field-green-800/20">
                <div className="p-2 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg mb-3 mx-auto w-fit">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-field-green-700 dark:text-field-green-300">
                  Email
                </div>
                <div className="text-xs text-field-green-600 dark:text-field-green-400 font-medium uppercase tracking-wide">
                  Support
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-pitch-blue-100 to-pitch-blue-200 dark:from-pitch-blue-900/30 dark:to-pitch-blue-800/20">
                <div className="p-2 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg mb-3 mx-auto w-fit">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-pitch-blue-700 dark:text-pitch-blue-300">
                  Discord
                </div>
                <div className="text-xs text-pitch-blue-600 dark:text-pitch-blue-400 font-medium uppercase tracking-wide">
                  Community
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-stadium-gold-100 to-stadium-gold-200 dark:from-stadium-gold-900/30 dark:to-stadium-gold-800/20">
                <div className="p-2 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg mb-3 mx-auto w-fit">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-stadium-gold-700 dark:text-stadium-gold-300">
                  Response
                </div>
                <div className="text-xs text-stadium-gold-600 dark:text-stadium-gold-400 font-medium uppercase tracking-wide">
                  Time
                </div>
              </div>
              
              <div className="hockey-stat-item bg-gradient-to-br from-goal-orange-100 to-goal-orange-200 dark:from-goal-orange-900/30 dark:to-goal-orange-800/20">
                <div className="p-2 bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 rounded-lg mb-3 mx-auto w-fit">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-goal-orange-700 dark:text-goal-orange-300">
                  Support
                </div>
                <div className="text-xs text-goal-orange-600 dark:text-goal-orange-400 font-medium uppercase tracking-wide">
                  Team
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Contact Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Email Contact */}
            <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
              <div className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg w-fit mx-auto mb-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Email Support</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Get help via email</p>
                <a 
                  href="mailto:midnightstudiosintl@outlook.com"
                  className="inline-flex items-center gap-2 bg-field-green-500 hover:bg-field-green-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
              </div>
            </div>

            {/* Discord Contact */}
            <div className="fifa-card-hover-enhanced border-pitch-blue-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-pitch-blue-50/50 dark:from-slate-900 dark:to-pitch-blue-900/20">
              <div className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg w-fit mx-auto mb-4">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Discord Community</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Join our Discord server</p>
                <a 
                  href="https://discord.gg/fifa26league"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-pitch-blue-500 hover:bg-pitch-blue-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  <MessageSquare className="h-4 w-4" />
                  Join Discord
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="fifa-card-hover-enhanced border-stadium-gold-200/50 dark:border-stadium-gold-700/50 bg-gradient-to-br from-white to-stadium-gold-50/50 dark:from-slate-900 dark:to-stadium-gold-900/20">
              <div className="p-6 text-center">
                <div className="p-3 bg-gradient-to-r from-stadium-gold-500 to-stadium-gold-600 rounded-lg w-fit mx-auto mb-4">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Response Time</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-2">We typically respond within:</p>
                <div className="space-y-1 text-sm">
                  <p className="text-stadium-gold-700 dark:text-stadium-gold-300">• Email: 24-48 hours</p>
                  <p className="text-stadium-gold-700 dark:text-stadium-gold-300">• Discord: 1-4 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="fifa-card-hover-enhanced border-field-green-200/50 dark:border-field-green-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-slate-900 dark:to-field-green-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-field-green-500 to-field-green-600 rounded-lg">
                  <Send className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Send us a Message
                </h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Subject *
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="What's this about?"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full min-h-[120px]"
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                
                {submitStatus === 'success' && (
                  <div className="flex items-center gap-2 p-4 bg-field-green-50 dark:bg-field-green-900/20 border border-field-green-200 dark:border-field-green-700 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-field-green-600" />
                    <p className="text-field-green-700 dark:text-field-green-300">
                      Thank you for your message! We'll get back to you soon.
                    </p>
                  </div>
                )}
                
                {submitStatus === 'error' && (
                  <div className="flex items-center gap-2 p-4 bg-goal-orange-50 dark:bg-goal-orange-900/20 border border-goal-orange-200 dark:border-goal-orange-700 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-goal-orange-600" />
                    <p className="text-goal-orange-700 dark:text-goal-orange-300">
                      Sorry, there was an error sending your message. Please try again.
                    </p>
                  </div>
                )}
                
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="fifa-card-hover-enhanced border-pitch-blue-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-pitch-blue-50/50 dark:from-slate-900 dark:to-pitch-blue-900/20">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-pitch-blue-500 to-pitch-blue-600 rounded-lg">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Frequently Asked Questions
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h3 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">How do I join the league?</h3>
                    <p className="text-pitch-blue-700 dark:text-pitch-blue-300 text-sm">
                      Visit our registration page during the open registration period and follow the signup process.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h3 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">What platforms are supported?</h3>
                    <p className="text-pitch-blue-700 dark:text-pitch-blue-300 text-sm">
                      We support PlayStation and Xbox platforms for FIFA 26.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h3 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">How are matches scheduled?</h3>
                    <p className="text-pitch-blue-700 dark:text-pitch-blue-300 text-sm">
                      Matches are typically scheduled for Wednesday, Thursday, and Friday evenings at 8:00, 8:35, and 9:10 PM EST.
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-pitch-blue-50 to-pitch-blue-100 dark:from-pitch-blue-900/20 dark:to-pitch-blue-800/20 p-4 rounded-lg border-l-4 border-pitch-blue-500">
                    <h3 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">Need more help?</h3>
                    <p className="text-pitch-blue-700 dark:text-pitch-blue-300 text-sm">
                      Check our FAQ page or join our Discord server for immediate assistance.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <a 
                  href="/faq" 
                  className="inline-flex items-center gap-2 text-pitch-blue-600 dark:text-pitch-blue-400 hover:text-pitch-blue-700 dark:hover:text-pitch-blue-300 font-medium underline decoration-2 underline-offset-2 hover:decoration-pitch-blue-500 transition-all duration-200"
                >
                  <BookOpen className="h-4 w-4" />
                  View Full FAQ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}