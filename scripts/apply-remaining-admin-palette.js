#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Remaining admin pages to update
const REMAINING_PAGES = [
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

function applyRemainingPalette(filePath) {
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

    // Apply text color updates for better readability
    content = content.replace(/text-slate-800 dark:text-slate-200/g, 'text-field-green-800 dark:text-field-green-200');
    content = content.replace(/text-slate-600 dark:text-slate-400/g, 'text-field-green-600 dark:text-field-green-400');
    content = content.replace(/text-slate-900 dark:text-slate-100/g, 'text-field-green-800 dark:text-field-green-200');
    content = content.replace(/text-slate-700 dark:text-slate-300/g, 'text-field-green-600 dark:text-field-green-400');
    content = content.replace(/text-slate-500 dark:text-slate-500/g, 'text-field-green-500 dark:text-field-green-500');

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

// Apply palette to all remaining admin pages
console.log('🎨 Applying SCS Bot Color Palette to Remaining Admin Pages...\n');

REMAINING_PAGES.forEach(page => {
  applyRemainingPalette(page);
});

console.log('\n✨ Remaining Admin Pages Color Palette application complete!');
