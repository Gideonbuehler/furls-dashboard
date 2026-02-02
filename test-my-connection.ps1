# FURLS Personal Diagnostic Test
# Run this to check YOUR connection and stats

Write-Host "`n=== FURLS Personal Diagnostic ===" -ForegroundColor Cyan
Write-Host "Testing your stats upload issue...`n" -ForegroundColor Gray

# Get your API key
Write-Host "[1/5] Enter your API key" -ForegroundColor Yellow
$apiKey = Read-Host "Paste your API key here"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ No API key provided" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $apiKey"
}

# Test 1: Verify API key
Write-Host "`n[2/5] Testing API key..." -ForegroundColor Yellow
try {
    $authTest = Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/test-auth" -Headers $headers -Method Get
    Write-Host "✅ API key is valid!" -ForegroundColor Green
    Write-Host "   Username: $($authTest.username)" -ForegroundColor Cyan
    Write-Host "   User ID: $($authTest.userId)" -ForegroundColor Cyan
    $username = $authTest.username
} catch {
    Write-Host "❌ API key is INVALID!" -ForegroundColor Red
    Write-Host "   Go to Settings and regenerate your key" -ForegroundColor Yellow
    exit 1
}

# Test 2: Try a real upload
Write-Host "`n[3/5] Testing upload functionality..." -ForegroundColor Yellow
try {
    $timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $testData = @{
        timestamp = $timestamp
        shots = 99
        goals = 88
        averageSpeed = 9999.99
        speedSamples = 500
        boostCollected = 777.0
        boostUsed = 666.0
        gameTime = 180
        possessionTime = 90.5
        teamPossessionTime = 120.0
        opponentPossessionTime = 60.0
        shotHeatmap = @()
        goalHeatmap = @()
    } | ConvertTo-Json

    $uploadResult = Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/upload" -Headers $headers -Method Post -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Upload successful!" -ForegroundColor Green
    Write-Host "   Session ID: $($uploadResult.sessionId)" -ForegroundColor Cyan
    Write-Host "   Message: $($uploadResult.message)" -ForegroundColor Cyan
    
    Write-Host "`n   🎯 TEST SESSION UPLOADED WITH:" -ForegroundColor Yellow
    Write-Host "      Shots: 99 (unique test value)" -ForegroundColor Cyan
    Write-Host "      Goals: 88 (unique test value)" -ForegroundColor Cyan
    Write-Host "      Speed: 9999.99 (unique test value)" -ForegroundColor Cyan
    Write-Host "      Boost Collected: 777" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Upload failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Yellow
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Yellow
    }
    exit 1
}

# Test 3: Check if session appears in history
Write-Host "`n[4/5] Checking if session appears in your history..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# We need JWT token for this, so let's just guide user
Write-Host "⚠️  Now manually check your dashboard:" -ForegroundColor Yellow
Write-Host "   1. Go to: https://furls-dashboard.onrender.com" -ForegroundColor Gray
Write-Host "   2. Login with username: $username" -ForegroundColor Gray
Write-Host "   3. Click 'History' tab" -ForegroundColor Gray
Write-Host "   4. Look for session with:" -ForegroundColor Gray
Write-Host "      - 99 shots" -ForegroundColor Cyan
Write-Host "      - 88 goals" -ForegroundColor Cyan
Write-Host "      - 9999 speed" -ForegroundColor Cyan
Write-Host "      - Timestamp: $timestamp" -ForegroundColor Cyan

# Test 4: Check plugin status
Write-Host "`n[5/5] Checking plugin connection status..." -ForegroundColor Yellow
try {
    $statusTest = Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/plugin-status" -Headers $headers -Method Get
    
    if ($statusTest.connected) {
        Write-Host "✅ Plugin status: CONNECTED" -ForegroundColor Green
        Write-Host "   Last upload: $($statusTest.lastUpload)" -ForegroundColor Cyan
        Write-Host "   Minutes since upload: $($statusTest.minutesSinceUpload)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️  Plugin status: OFFLINE" -ForegroundColor Yellow
        Write-Host "   Message: $($statusTest.message)" -ForegroundColor Gray
    }
} catch {
    Write-Host "⚠️  Could not check plugin status" -ForegroundColor Yellow
}

Write-Host "`n=== DIAGNOSIS ===" -ForegroundColor Cyan

Write-Host "`n✅ Your API key works correctly" -ForegroundColor Green
Write-Host "✅ Upload endpoint works correctly" -ForegroundColor Green
Write-Host "✅ A test session was saved to database" -ForegroundColor Green

Write-Host "`n📊 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Check your dashboard History tab for the test session (99 shots, 88 goals)" -ForegroundColor Gray
Write-Host "2. If you SEE the test session:" -ForegroundColor Gray
Write-Host "   ✅ Server is working fine!" -ForegroundColor Green
Write-Host "   ❌ Problem is with the BakkesMod plugin configuration" -ForegroundColor Red
Write-Host "`n3. If you DON'T see the test session:" -ForegroundColor Gray
Write-Host "   ❌ Problem is with the dashboard/database" -ForegroundColor Red
Write-Host "   📧 Contact admin with your username and timestamp above" -ForegroundColor Yellow

Write-Host "`n🔧 PLUGIN TROUBLESHOOTING:" -ForegroundColor Yellow
Write-Host "If the test session appears but your GAME sessions don't:" -ForegroundColor Gray
Write-Host "1. Open Rocket League" -ForegroundColor Gray
Write-Host "2. Press F6 (BakkesMod console)" -ForegroundColor Gray
Write-Host "3. Type: plugin list" -ForegroundColor Gray
Write-Host "4. Verify FURLS is in the list" -ForegroundColor Gray
Write-Host "5. Open FURLS control panel" -ForegroundColor Gray
Write-Host "6. Verify:" -ForegroundColor Gray
Write-Host "   - API key matches: $($apiKey.Substring(0,20))..." -ForegroundColor Cyan
Write-Host "   - 'Automatic Upload' is ENABLED" -ForegroundColor Cyan
Write-Host "   - Dashboard URL is set" -ForegroundColor Cyan
Write-Host "7. Play a Freeplay match (shoot 5+ balls)" -ForegroundColor Gray
Write-Host "8. EXIT the match completely (Esc → Leave Match)" -ForegroundColor Gray
Write-Host "9. Check BakkesMod console for upload messages" -ForegroundColor Gray
Write-Host "10. Refresh dashboard" -ForegroundColor Gray

Write-Host "`n📝 Common Issues:" -ForegroundColor Yellow
Write-Host "- Plugin only uploads AFTER you exit a match, not during" -ForegroundColor Gray
Write-Host "- Training packs don't trigger uploads (Freeplay does)" -ForegroundColor Gray
Write-Host "- Must completely exit match, not just pause" -ForegroundColor Gray
Write-Host "- Console will show 'Upload success' or error message" -ForegroundColor Gray

Write-Host "`n🌐 Dashboard: https://furls-dashboard.onrender.com" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
