#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// SCS Bot Color Palette Template
const ADMIN_PALETTE_TEMPLATE = {
  // Background
  background: 'min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar',
  
  // Hero Header
  heroHeader: `{/* Enhanced Hero Header Section */}
      <div className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-hockey-pattern opacity-5"></div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-field-green-500/20 to-pitch-blue-500/20 rounded-full"></div>
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-assist-green-500/20 to-assist-green-500/20 rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-10 left-1/4 w-12 h-12 bg-gradient-to-r from-field-green-500/20 to-field-green-500/20 rounded-full" style={{ animationDelay: '2s' }}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-gradient-to-r from-field-green-500 to-pitch-blue-600 rounded-full shadow-2xl shadow-field-green-500/30">
              <{ICON} className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="hockey-title mb-4 text-white">
            {TITLE}
          </h1>
          <p className="hockey-subtitle mb-8 text-white/90">
            {SUBTITLE}
          </p>
        </div>
      </div>`,

  // Main Content Container
  mainContent: `{/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 pb-12">`,

  // Card Styling
  card: 'hockey-card hockey-card-hover border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300',
  
  // Card Header
  cardHeader: 'border-b-2 border-field-green-200/50 dark:border-pitch-blue-700/50 pb-4',
  
  // Card Title
  cardTitle: 'flex items-center gap-3 text-2xl font-bold text-field-green-800 dark:text-field-green-200',
  
  // Card Description
  cardDescription: 'text-field-green-600 dark:text-field-green-400 text-base',
  
  // Button Styling
  primaryButton: 'hockey-button bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300',
  
  secondaryButton: 'hockey-button bg-gradient-to-r from-assist-green-500 to-assist-green-600 hover:from-assist-green-600 hover:to-assist-green-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300',
  
  dangerButton: 'hockey-button bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 hover:from-goal-orange-600 hover:to-goal-orange-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300',
  
  // Text Colors
  textPrimary: 'text-field-green-800 dark:text-field-green-200',
  textSecondary: 'text-field-green-600 dark:text-field-green-400',
  textMuted: 'text-field-green-500 dark:text-field-green-500',
  
  // Table Styling
  tableHeader: 'bg-gradient-to-r from-field-green-50/50 to-pitch-blue-50/50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 border-b-2 border-field-green-200/50 dark:border-pitch-blue-700/50',
  tableRow: 'hover:bg-gradient-to-r hover:from-field-green-50/30 hover:to-pitch-blue-50/30 dark:hover:from-field-green-900/10 dark:hover:to-pitch-blue-900/10 transition-all duration-300 border-b border-field-green-200/30 dark:border-pitch-blue-700/30',
  tableHead: 'text-field-green-800 dark:text-field-green-200 font-bold',
  tableCell: 'text-field-green-800 dark:text-field-green-200',
  tableCellSecondary: 'text-field-green-600 dark:text-field-green-400'
};

// List of admin pages to update
const ADMIN_PAGES = [
  'app/admin/page.tsx',
  'app/admin/user-management/page.tsx',
  'app/admin/league-management/page.tsx',
  'app/admin/statistics/page.tsx',
  'app/admin/schedule/page.tsx',
  'app/admin/news/page.tsx',
  'app/admin/photos/page.tsx',
  'app/admin/tokens/page.tsx',
  'app/admin/audit-logs/page.tsx',
  'app/admin/registrations/page.tsx',
  'app/admin/users/page.tsx',
  'app/admin/ea-matches/page.tsx',
  'app/admin/ea-stats/page.tsx',
  'app/admin/player-mappings/page.tsx',
  'app/admin/rbac-debug/page.tsx',
  'app/admin/reset-user-password/page.tsx',
  'app/admin/password-reset/page.tsx',
  'app/admin/discord-debug/page.tsx',
  'app/admin/setup-bot-config/page.tsx',
  'app/admin/email-verification/page.tsx',
  'app/admin/complete-user-deletion/page.tsx',
  'app/admin/club-logos/page.tsx',
  'app/admin/club-availability/page.tsx',
  'app/admin/league/page.tsx',
  'app/admin/league-new/page.tsx',
  'app/admin/update-current-season/page.tsx',
  'app/admin/featured-games/page.tsx',
  'app/admin/database-structure/page.tsx',
  'app/admin/daily-recap/page.tsx',
  'app/admin/sync-auth-database/page.tsx',
  'app/admin/sync-missing-users/page.tsx',
  'app/admin/role-sync/page.tsx',
  'app/admin/fix-user-constraints/page.tsx',
  'app/admin/fix-console-values/page.tsx',
  'app/admin/transfer-recap/page.tsx',
  'app/admin/ensure-system-settings-recap/page.tsx',
  'app/admin/orphaned-users/page.tsx',
  'app/admin/user-diagnostics/page.tsx'
];

function applyPaletteToFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Apply background styling
    content = content.replace(
      /className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900\/30"/g,
      'className="min-h-screen bg-gradient-to-br from-field-green-50 via-white to-pitch-blue-50 dark:from-field-green-900 dark:via-slate-800 dark:to-pitch-blue-900/30 fifa-scrollbar"'
    );

    // Apply text color updates
    content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-field-green-800 dark:text-field-green-200');
    content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-field-green-600 dark:text-field-green-400');
    content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-field-green-800 dark:text-field-green-200');
    content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-field-green-600 dark:text-field-green-400');

    // Apply card styling
    content = content.replace(/className="[^"]*Card[^"]*"/g, (match) => {
      if (match.includes('hockey-card')) return match;
      return match.replace('className="', 'className="hockey-card hockey-card-hover border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-300 ');
    });

    // Apply button styling
    content = content.replace(/className="[^"]*Button[^"]*"/g, (match) => {
      if (match.includes('hockey-button')) return match;
      if (match.includes('variant="destructive"')) {
        return match.replace('className="', 'className="hockey-button bg-gradient-to-r from-goal-orange-500 to-goal-orange-600 hover:from-goal-orange-600 hover:to-goal-orange-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ');
      }
      if (match.includes('variant="outline"')) {
        return match.replace('className="', 'className="hockey-button bg-gradient-to-r from-field-green-500 to-pitch-blue-600 hover:from-field-green-600 hover:to-pitch-blue-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ');
      }
      return match.replace('className="', 'className="hockey-button bg-gradient-to-r from-assist-green-500 to-assist-green-600 hover:from-assist-green-600 hover:to-assist-green-700 text-white border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 ');
    });

    // Write the updated content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Apply palette to all admin pages
console.log('🎨 Applying SCS Bot Color Palette to Admin Pages...\n');

ADMIN_PAGES.forEach(page => {
  applyPaletteToFile(page);
});

console.log('\n✨ SCS Bot Color Palette application complete!');
