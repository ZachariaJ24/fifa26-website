# Cleanup Bidding System Files - PowerShell Script
# This script will remove all bidding-related files from the website

Write-Host "🧹 Starting Bidding System Cleanup..." -ForegroundColor Green

# Define patterns for bidding-related files
$biddingPatterns = @(
    "*bid*",
    "*Bid*", 
    "*BIDDING*",
    "*bidding*"
)

# Define directories to clean
$directoriesToClean = @(
    "app",
    "components", 
    "lib",
    "sql",
    "."
)

# Files to remove (exact matches)
$filesToRemove = @(
    "app\actions\bidding.ts",
    "app\api\bids\route.ts",
    "app\api\bids\[id]\route.ts",
    "app\api\extend-bid\route.ts",
    "components\management\team-bids.tsx",
    "lib\bid-cleanup.ts",
    "lib\auto-bid-processor.ts",
    "lib\types\bidding.ts",
    "components\free-agency\bid-modal.tsx",
    "components\free-agency\bid-history-modal.tsx",
    "components\admin\bidding-settings.tsx",
    "components\admin\bid-processor.tsx",
    "components\admin\add-finalized-bidding-migration.tsx",
    "components\admin\manual-removal-tracking-migration.tsx"
)

# API routes to remove
$apiRoutesToRemove = @(
    "app\api\admin\bidding-recap\route.ts",
    "app\api\admin\create-bid\route.ts",
    "app\api\admin\delete-user-complete\route.ts",
    "app\api\admin\extend-all-bids\route.ts",
    "app\api\admin\fix-bidding-assignments\route.ts",
    "app\api\admin\fix-bidding-system\route.ts",
    "app\api\admin\fix-bidding-system-v2\route.ts",
    "app\api\admin\force-end-bids\route.ts",
    "app\api\admin\remove-user-bids\route.ts",
    "app\api\admin\reset-all-bids\route.ts",
    "app\api\admin\reset-bids\route.ts",
    "app\api\admin\test-bidding-fix\route.ts",
    "app\api\admin\test-bidding-relationships\route.ts",
    "app\api\admin\update-bid\route.ts",
    "app\api\cron\process-expired-bids\route.ts",
    "app\api\waivers\route.ts"
)

# Migration files to remove
$migrationFilesToRemove = @(
    "app\api\admin\run-migration\add-finalized-bidding\route.ts",
    "app\api\admin\run-migration\manual-removal-tracking\route.ts",
    "app\api\admin\run-migration\update-bid-expiration\route.ts"
)

# SQL files to remove
$sqlFilesToRemove = @(
    "sql\migrations\fix-bidding-user-relationship.sql",
    "sql\migrations\create_bid_transaction_function.sql",
    "fix_bidding_constraint_correct.sql",
    "fix_bidding_constraint_safe_clean.sql",
    "fix_bidding_constraint_safe.sql",
    "cleanup_duplicate_bids.sql",
    "test_bidding_constraint.sql"
)

# Combine all files to remove
$allFilesToRemove = $filesToRemove + $apiRoutesToRemove + $migrationFilesToRemove + $sqlFilesToRemove

Write-Host "📋 Files to remove:" -ForegroundColor Yellow
foreach ($file in $allFilesToRemove) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (not found)" -ForegroundColor Red
    }
}

# Ask for confirmation
$confirmation = Read-Host "`n⚠️  This will permanently delete all bidding-related files. Continue? (y/N)"
if ($confirmation -ne "y" -and $confirmation -ne "Y") {
    Write-Host "❌ Cleanup cancelled by user." -ForegroundColor Red
    exit
}

# Remove files
$removedCount = 0
$notFoundCount = 0

foreach ($file in $allFilesToRemove) {
    if (Test-Path $file) {
        try {
            Remove-Item $file -Force
            Write-Host "🗑️  Removed: $file" -ForegroundColor Green
            $removedCount++
        } catch {
            Write-Host "❌ Error removing $file`: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        $notFoundCount++
    }
}

# Remove empty directories
$directoriesToCheck = @(
    "app\api\bids",
    "app\api\extend-bid", 
    "app\api\cron\process-expired-bids",
    "app\api\waivers",
    "sql\migrations"
)

foreach ($dir in $directoriesToCheck) {
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -File
        if ($files.Count -eq 0) {
            try {
                Remove-Item $dir -Recurse -Force
                Write-Host "🗑️  Removed empty directory: $dir" -ForegroundColor Green
            } catch {
                Write-Host "❌ Error removing directory $dir`: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

# Summary
Write-Host "`n📊 Cleanup Summary:" -ForegroundColor Cyan
Write-Host "  ✅ Files removed: $removedCount" -ForegroundColor Green
Write-Host "  ❌ Files not found: $notFoundCount" -ForegroundColor Red
Write-Host "  📁 Total files processed: $($allFilesToRemove.Count)" -ForegroundColor Blue

Write-Host "`n🎉 Bidding system cleanup complete!" -ForegroundColor Green
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run the SQL cleanup script: cleanup_bidding_system.sql" -ForegroundColor White
Write-Host "  2. Test the transfer system functionality" -ForegroundColor White
Write-Host "  3. Update any remaining references in code" -ForegroundColor White
