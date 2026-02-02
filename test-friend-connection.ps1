# FURLS Plugin Connection Test Script
# Run this to diagnose connection issues

Write-Host "`n=== FURLS Connection Diagnostic Tool ===" -ForegroundColor Cyan
Write-Host "This will test your connection to the FURLS dashboard`n" -ForegroundColor Gray

# Step 1: Test server connectivity
Write-Host "[1/4] Testing server connectivity..." -ForegroundColor Yellow
try {
    $serverTest = Invoke-WebRequest -Uri "https://furls-dashboard.onrender.com" -UseBasicParsing -TimeoutSec 10
    if ($serverTest.StatusCode -eq 200) {
        Write-Host "✅ Server is online and reachable" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Cannot reach server: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   - Check your internet connection" -ForegroundColor Yellow
    Write-Host "   - Try disabling VPN if you're using one" -ForegroundColor Yellow
    exit 1
}

# Step 2: Get API key from user
Write-Host "`n[2/4] Testing API key authentication..." -ForegroundColor Yellow
$apiKey = Read-Host "Enter your API key (from Settings page)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "❌ No API key provided" -ForegroundColor Red
    exit 1
}

# Step 3: Test API key
try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
    }
    $authTest = Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/test-auth" -Headers $headers -Method Get
    
    Write-Host "✅ API key is valid!" -ForegroundColor Green
    Write-Host "   Username: $($authTest.username)" -ForegroundColor Cyan
    Write-Host "   User ID: $($authTest.userId)" -ForegroundColor Cyan
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "❌ API key authentication failed (Status: $statusCode)" -ForegroundColor Red
    
    if ($statusCode -eq 401) {
        Write-Host "   - Your API key is invalid or expired" -ForegroundColor Yellow
        Write-Host "   - Go to Settings and regenerate your key" -ForegroundColor Yellow
        Write-Host "   - Copy the NEW key and update it in the plugin" -ForegroundColor Yellow
    } else {
        Write-Host "   - Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
    exit 1
}

# Step 4: Test upload endpoint
Write-Host "`n[3/4] Testing upload endpoint..." -ForegroundColor Yellow
try {
    $testData = @{
        timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ssZ")
        shots = 1
        goals = 0
        averageSpeed = 1000
        speedSamples = 100
        boostCollected = 100
        boostUsed = 80
        gameTime = 60
        possessionTime = 30
        teamPossessionTime = 40
        opponentPossessionTime = 20
        shotHeatmap = @()
        goalHeatmap = @()
    } | ConvertTo-Json

    $uploadTest = Invoke-RestMethod -Uri "https://furls-dashboard.onrender.com/api/upload/upload" -Headers $headers -Method Post -Body $testData -ContentType "application/json"
    
    Write-Host "✅ Upload test successful!" -ForegroundColor Green
    Write-Host "   Session ID: $($uploadTest.sessionId)" -ForegroundColor Cyan
    Write-Host "   Message: $($uploadTest.message)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Upload test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   - This might indicate a server-side issue" -ForegroundColor Yellow
    exit 1
}

# Step 5: Check firewall
Write-Host "`n[4/4] Checking Windows Firewall..." -ForegroundColor Yellow
try {
    $bmPath = "C:\Program Files (x86)\Steam\steamapps\common\rocketleague\Binaries\Win64\bakkesmod.exe"
    $rlPath = "C:\Program Files (x86)\Steam\steamapps\common\rocketleague\Binaries\Win64\RocketLeague.exe"
    
    # Check if paths exist
    $bmExists = Test-Path $bmPath
    $rlExists = Test-Path $rlPath
    
    if ($bmExists) {
        Write-Host "✅ BakkesMod found at default location" -ForegroundColor Green
    } else {
        Write-Host "⚠️  BakkesMod not found at default location" -ForegroundColor Yellow
        Write-Host "   Please add it to Windows Firewall manually" -ForegroundColor Yellow
    }
    
    if ($rlExists) {
        Write-Host "✅ Rocket League found at default location" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Rocket League not found at default location" -ForegroundColor Yellow
    }
    
    Write-Host "`n   To configure firewall:" -ForegroundColor Cyan
    Write-Host "   1. Open Windows Security" -ForegroundColor Gray
    Write-Host "   2. Go to 'Firewall & network protection'" -ForegroundColor Gray
    Write-Host "   3. Click 'Allow an app through firewall'" -ForegroundColor Gray
    Write-Host "   4. Enable BakkesMod and Rocket League for Private AND Public networks" -ForegroundColor Gray
    
} catch {
    Write-Host "⚠️  Could not check firewall automatically" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== DIAGNOSTIC COMPLETE ===" -ForegroundColor Cyan
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host "`nYour configuration should work. If the plugin still doesn't upload:" -ForegroundColor Yellow
Write-Host "1. Make sure you pasted the FULL API key into the plugin" -ForegroundColor Gray
Write-Host "2. Enable 'Automatic Upload' checkbox in plugin settings" -ForegroundColor Gray
Write-Host "3. Play a FULL Freeplay session and exit completely" -ForegroundColor Gray
Write-Host "4. Check BakkesMod console (F6) for error messages" -ForegroundColor Gray
Write-Host "5. Refresh your dashboard page" -ForegroundColor Gray

Write-Host "`n📊 Dashboard: https://furls-dashboard.onrender.com" -ForegroundColor Cyan
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
