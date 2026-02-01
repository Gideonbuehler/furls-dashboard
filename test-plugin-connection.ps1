# Test Plugin Connection - PowerShell Script
# This script tests if your FURLS Dashboard server can receive plugin uploads

Write-Host "🔧 FURLS Plugin Connection Tester" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if server is running
Write-Host "Test 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3002/api/health" -UseBasicParsing
    Write-Host "✅ Server is running!" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "❌ Server is NOT running!" -ForegroundColor Red
    Write-Host "   Please run: npm start" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Test 2: Check plugin endpoint without API key (should get 401)
Write-Host "Test 2: Testing plugin endpoint (without API key)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/api/stats/plugin-status" -UseBasicParsing -ErrorAction Stop
    Write-Host "⚠️  Endpoint accessible but should require API key!" -ForegroundColor Yellow
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Plugin endpoint is working (requires API key)" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: Status $statusCode" -ForegroundColor Red
    }
}
Write-Host ""

# Test 3: Test with user's API key
Write-Host "Test 3: Testing with YOUR API key..." -ForegroundColor Yellow
$apiKey = Read-Host "Enter your API key (from Settings page)"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host "⚠️  No API key provided, skipping authenticated test" -ForegroundColor Yellow
    Write-Host ""
} else {
    try {
        $headers = @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        }

        # Test plugin status endpoint
        $status = Invoke-RestMethod -Uri "http://localhost:3002/api/stats/plugin-status" -Headers $headers -UseBasicParsing
        Write-Host "✅ API key is valid!" -ForegroundColor Green
        Write-Host "   Connected: $($status.connected)" -ForegroundColor Gray
        Write-Host "   Message: $($status.message)" -ForegroundColor Gray
        Write-Host ""

        # Test upload endpoint
        Write-Host "Test 4: Simulating plugin upload..." -ForegroundColor Yellow
        $testData = @{
            timestamp = (Get-Date).ToString("o")
            shots = 5
            goals = 3
            averageSpeed = 75.0
            speedSamples = 100
            boostCollected = 250.0
            boostUsed = 180.0
            gameTime = 120.0
            possessionTime = 60.0
            teamPossessionTime = 80.0
            opponentPossessionTime = 40.0
            shotHeatmap = @()
            goalHeatmap = @()
        } | ConvertTo-Json

        $uploadResult = Invoke-RestMethod -Uri "http://localhost:3002/api/stats/upload" -Method POST -Headers $headers -Body $testData -UseBasicParsing
        Write-Host "✅ Upload successful!" -ForegroundColor Green
        Write-Host "   $($uploadResult.message)" -ForegroundColor Gray
        Write-Host ""

    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ API key test failed!" -ForegroundColor Red
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq 401) {
            Write-Host "   Error: Invalid API key" -ForegroundColor Yellow
            Write-Host "   Solution: Get a new API key from Settings page" -ForegroundColor Yellow
        } elseif ($statusCode -eq 503) {
            Write-Host "   Error: Service unavailable" -ForegroundColor Yellow
            Write-Host "   Solution: Make sure server is running with 'npm start'" -ForegroundColor Yellow
        }
        Write-Host ""
    }
}

# Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "🎯 Configuration for BakkesMod Plugin:" -ForegroundColor Cyan
Write-Host "   API URL: http://localhost:3002" -ForegroundColor White
Write-Host "   (NO /api or /upload at the end!)" -ForegroundColor Gray
Write-Host ""
Write-Host "📝 To get your API key:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:5173" -ForegroundColor White
Write-Host "   2. Login to your account" -ForegroundColor White
Write-Host "   3. Go to Settings tab" -ForegroundColor White
Write-Host "   4. Copy your API key" -ForegroundColor White
Write-Host ""
Write-Host "✅ If all tests passed, your plugin should work!" -ForegroundColor Green
Write-Host ""

Read-Host "Press Enter to exit"
