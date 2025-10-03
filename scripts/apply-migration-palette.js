#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Migration pages to update
const MIGRATION_PAGES = [
  'app/admin/verification-tokens-migration/page.tsx',
  'app/admin/token-system-migration/page.tsx',
  'app/admin/team-managers-table-migration/page.tsx',
  'app/admin/table-info-migration/page.tsx',
  'app/admin/table-exists-migration/page.tsx',
  'app/admin/retained-salary-migration/page.tsx',
  'app/admin/remove-general-discussion-migration/page.tsx',
  'app/admin/player-awards-migration/page.tsx',
  'app/admin/notification-columns-migration/page.tsx',
  'app/admin/manual-removal-tracking-migration/page.tsx',
  'app/admin/injury-reserves-migration/page.tsx',
  'app/admin/goalie-columns-migration/page.tsx',
  'app/admin/gamer-tag-migration/page.tsx',
  'app/admin/forum-tables-migration/page.tsx',
  'app/admin/forum-tables-fixed-migration/page.tsx',
  'app/admin/forum-replies-migration/page.tsx',
  'app/admin/forum-categories-admin-only-migration/page.tsx',
  'app/admin/fix-existing-bids-migration/page.tsx',
  'app/admin/fix-discord-connections-migration/page.tsx',
  'app/admin/ensure-discord-tables-migration/page.tsx',
  'app/admin/ea-team-stats-migration/page.tsx',
  'app/admin/ea-stats-fields-migration/page.tsx',
  'app/admin/ea-stats-columns-migration/page.tsx',
  'app/admin/ea-player-mappings-migration/page.tsx',
  'app/admin/ea-more-columns-migration/page.tsx',
  'app/admin/ea-match-data-migration/page.tsx',
  'app/admin/ea-columns-migration/page.tsx',
  'app/admin/discord-users-table-migration/page.tsx',
  'app/admin/discord-sync-failures-migration/page.tsx',
  'app/admin/discord-integration-migration/page.tsx',
  'app/admin/discord-bot-config-migration/page.tsx',
  'app/admin/category-column-migration/page.tsx',
  'app/admin/ban-columns-migration/page.tsx',
  'app/admin/auto-user-creation-migration/page.tsx',
  'app/admin/add-games-played-migration/page.tsx',
  'app/admin/add-finalized-bidding-migration/page.tsx'
];

function applyMigrationPalette(filePath) {
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

    // Apply table styling
    content = content.replace(/className="[^"]*Table[^"]*"/g, (match) => {
      if (match.includes('hockey-card')) return match;
      return match.replace('className="', 'className="hockey-card border-field-green-200/50 dark:border-pitch-blue-700/50 bg-gradient-to-br from-white to-field-green-50/50 dark:from-field-green-900 dark:to-pitch-blue-900/20 rounded-xl overflow-hidden shadow-lg ');
    });

    // Apply table header styling
    content = content.replace(/className="[^"]*TableHeader[^"]*"/g, (match) => {
      return match.replace('className="', 'className="bg-gradient-to-r from-field-green-50/50 to-pitch-blue-50/50 dark:from-field-green-900/20 dark:to-pitch-blue-900/20 border-b-2 border-field-green-200/50 dark:border-pitch-blue-700/50 ');
    });

    // Apply table row styling
    content = content.replace(/className="[^"]*TableRow[^"]*"/g, (match) => {
      if (match.includes('hover:bg-gradient-to-r')) return match;
      return match.replace('className="', 'className="hover:bg-gradient-to-r hover:from-field-green-50/30 hover:to-pitch-blue-50/30 dark:hover:from-field-green-900/10 dark:hover:to-pitch-blue-900/10 transition-all duration-300 border-b border-field-green-200/30 dark:border-pitch-blue-700/30 ');
    });

    // Apply table head styling
    content = content.replace(/className="[^"]*TableHead[^"]*"/g, (match) => {
      if (match.includes('text-field-green-800')) return match;
      return match.replace('className="', 'className="text-field-green-800 dark:text-field-green-200 font-bold ');
    });

    // Apply table cell styling
    content = content.replace(/className="[^"]*TableCell[^"]*"/g, (match) => {
      if (match.includes('text-field-green-800') || match.includes('text-field-green-600')) return match;
      return match.replace('className="', 'className="text-field-green-800 dark:text-field-green-200 ');
    });

    // Write the updated content back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// Apply palette to all migration pages
console.log('🎨 Applying SCS Bot Color Palette to Migration Pages...\n');

MIGRATION_PAGES.forEach(page => {
  applyMigrationPalette(page);
});

console.log('\n✨ Migration Pages Color Palette application complete!');
