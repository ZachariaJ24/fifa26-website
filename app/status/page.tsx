export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-stadium-gold-900 dark:via-stadium-gold-800 dark:to-pitch-blue-900/30 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-field-green-600 via-pitch-blue-600 to-stadium-gold-600 dark:from-field-green-400 dark:via-pitch-blue-400 dark:to-stadium-gold-400 bg-clip-text text-transparent mb-4">
            FIFA 26 League
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            The premier FIFA 26 competitive gaming league
          </p>
        </div>
        
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 border border-field-green-200/50 dark:border-pitch-blue-700/50 shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
            🎉 Website Successfully Deployed!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Your FIFA 26 League website is now live and running on Vercel. 
            The complete transformation from hockey to football theme has been successful.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="bg-field-green-50 dark:bg-field-green-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-field-green-800 dark:text-field-green-200 mb-2">
                ✅ FIFA Theme Applied
              </h3>
              <p className="text-sm text-field-green-600 dark:text-field-green-400">
                Complete color scheme transformation with field-green, pitch-blue, stadium-gold, goal-orange, and assist-white colors.
              </p>
            </div>
            
            <div className="bg-pitch-blue-50 dark:bg-pitch-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-pitch-blue-800 dark:text-pitch-blue-200 mb-2">
                ⚽ Football Terminology
              </h3>
              <p className="text-sm text-pitch-blue-600 dark:text-pitch-blue-400">
                All hockey references replaced with football/soccer terminology throughout the site.
              </p>
            </div>
            
            <div className="bg-stadium-gold-50 dark:bg-stadium-gold-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-stadium-gold-800 dark:text-stadium-gold-200 mb-2">
                🏆 Professional Branding
              </h3>
              <p className="text-sm text-stadium-gold-600 dark:text-stadium-gold-400">
                Updated to FIFA 26 League branding with football club themes and colors.
              </p>
            </div>
            
            <div className="bg-goal-orange-50 dark:bg-goal-orange-900/20 p-4 rounded-lg">
              <h3 className="font-semibold text-goal-orange-800 dark:text-goal-orange-200 mb-2">
                🚀 Build Success
              </h3>
              <p className="text-sm text-goal-orange-600 dark:text-goal-orange-400">
                All CSS compilation issues resolved and dependencies updated successfully.
              </p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
              🔧 Next Steps
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              To enable full functionality, add your Supabase environment variables in Vercel:
              <br />• NEXT_PUBLIC_SUPABASE_URL
              <br />• NEXT_PUBLIC_SUPABASE_ANON_KEY  
              <br />• SUPABASE_SERVICE_ROLE_KEY
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
