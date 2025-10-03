@echo off
echo ========================================
echo    SCS Enhanced Bot Setup Script
echo ========================================
echo.

echo [1/4] Creating backup of current bot...
if exist index.js (
    copy index.js index.js.backup
    echo ✅ Backup created: index.js.backup
) else (
    echo ⚠️  No index.js found to backup
)

echo.
echo [2/4] Installing enhanced bot...
copy enhanced-bot.js index.js
echo ✅ Enhanced bot installed

echo.
echo [3/4] Checking dependencies...
if exist package.json (
    echo ✅ package.json found
    echo 📦 Run 'npm install' if you need to update dependencies
) else (
    echo ❌ package.json not found
    echo Please ensure you're in the correct directory
)

echo.
echo [4/4] Setup complete!
echo.
echo Next steps:
echo 1. Run the ELO database migration in Supabase
echo 2. Start the bot with: npm start
echo 3. Test with: !help
echo.
echo For detailed instructions, see: INTEGRATION_GUIDE.md
echo.
pause
