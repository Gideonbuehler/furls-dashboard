# Check if playlist/MMR columns exist in production database on Render.com
# This script needs your DATABASE_URL from Render.com

Write-Host "`n🔍 FURLS Playlist/MMR Database Diagnostic`n" -ForegroundColor Cyan
Write-Host "This script will check if the playlist and MMR columns exist in your production database." -ForegroundColor Gray
Write-Host ""

# Check if DATABASE_URL is set
if (-not $env:DATABASE_URL) {
    Write-Host "⚠️  DATABASE_URL environment variable not set!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To check your PRODUCTION database on Render.com:" -ForegroundColor White
    Write-Host "1. Go to your Render.com dashboard" -ForegroundColor Gray
    Write-Host "2. Click on your PostgreSQL database" -ForegroundColor Gray
    Write-Host "3. Copy the 'External Database URL'" -ForegroundColor Gray
    Write-Host "4. Run this command:" -ForegroundColor Gray
    Write-Host ""
    Write-Host '   $env:DATABASE_URL = "postgres://..."' -ForegroundColor Green
    Write-Host '   node check_remote_playlist_mmr.js' -ForegroundColor Green
    Write-Host ""
    Write-Host "Running local SQLite check instead..." -ForegroundColor Yellow
    Write-Host ""
}

# Run the diagnostic
node check_remote_playlist_mmr.js

Write-Host "`n" -ForegroundColor Gray
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor DarkGray
Write-Host ""
Write-Host "📌 DIAGNOSIS HELP:" -ForegroundColor Cyan
Write-Host ""
Write-Host "If columns are MISSING:" -ForegroundColor Yellow
Write-Host "  → Redeploy your app on Render.com to run migrations" -ForegroundColor Gray
Write-Host "  → Migrations run automatically when the server starts" -ForegroundColor Gray
Write-Host ""
Write-Host "If columns EXIST but no data:" -ForegroundColor Yellow
Write-Host "  → The plugin is NOT sending playlist/MMR fields" -ForegroundColor Gray
Write-Host "  → Check if your BakkesMod plugin is up-to-date" -ForegroundColor Gray
Write-Host "  → The plugin needs to capture and send these fields:" -ForegroundColor Gray
Write-Host "     • playlist (string)" -ForegroundColor DarkGray
Write-Host "     • isRanked (boolean)" -ForegroundColor DarkGray
Write-Host "     • mmr (number)" -ForegroundColor DarkGray
Write-Host "     • mmrChange (number)" -ForegroundColor DarkGray
Write-Host ""
