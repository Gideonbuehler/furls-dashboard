# 🔍 Quick User API Key Check
# Use this to quickly check if a user has an API key

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    [string]$ApiUrl = "https://furls.net"
)

Write-Host "`n🔍 Checking API Key Status for User: $Username" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

# Note: This requires database access. Run these queries in your PostgreSQL console
Write-Host "📊 Run this query in your PostgreSQL database:" -ForegroundColor Yellow
Write-Host @"

SELECT 
    id,
    username,
    email,
    CASE 
        WHEN api_key IS NULL THEN '❌ NO API KEY'
        WHEN api_key = '' THEN '❌ EMPTY'
        ELSE CONCAT('✅ HAS KEY (', LENGTH(api_key), ' chars)')
    END as api_key_status,
    CASE 
        WHEN last_active IS NULL THEN '❌ NEVER UPLOADED'
        ELSE CONCAT('✅ Last upload: ', last_active)
    END as upload_status,
    total_sessions,
    total_shots,
    total_goals,
    created_at
FROM users 
WHERE username = '$Username';

"@ -ForegroundColor White

Write-Host "`n💡 If user has NO API KEY, run this to generate one:" -ForegroundColor Yellow
Write-Host @"

UPDATE users 
SET api_key = encode(gen_random_bytes(32), 'hex') 
WHERE username = '$Username';

-- Then verify:
SELECT username, LENGTH(api_key) as key_length, SUBSTRING(api_key, 1, 8) as key_preview
FROM users 
WHERE username = '$Username';

"@ -ForegroundColor White

Write-Host "`n🔧 Tell the user to:" -ForegroundColor Cyan
Write-Host "1. Logout of https://furls.net" -ForegroundColor White
Write-Host "2. Login again" -ForegroundColor White
Write-Host "3. Go to Settings tab" -ForegroundColor White
Write-Host "4. Copy the API key (should now be visible)" -ForegroundColor White
Write-Host "5. Update BakkesMod plugin config" -ForegroundColor White
Write-Host "`n📁 Plugin config location:" -ForegroundColor Yellow
Write-Host "%APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg" -ForegroundColor Gray
