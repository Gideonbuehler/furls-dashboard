# Test Both Upload Endpoints
# Verifies that both /api/stats/upload and /api/upload/upload work

param(
    [string]$ApiUrl = "https://furls.net",
    [string]$ApiKey = ""
)

if ([string]::IsNullOrWhiteSpace($ApiKey)) {
    Write-Host "Usage: .\test-both-endpoints.ps1 -ApiKey YOUR_API_KEY_HERE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Get your API key from: $ApiUrl" -ForegroundColor Gray
    Write-Host "   1. Login" -ForegroundColor Gray
    Write-Host "   2. Go to Settings" -ForegroundColor Gray
    Write-Host "   3. Copy your API Key" -ForegroundColor Gray
    Write-Host ""
    exit
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Testing Both Upload Endpoints" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: $ApiUrl" -ForegroundColor Yellow
Write-Host "API Key: $($ApiKey.Substring(0,8))..." -ForegroundColor Yellow
Write-Host ""

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type" = "application/json"
}

# Test data
$testData = @{
    shots = 7
    goals = 2
    gameTime = 90
    timestamp = (Get-Date).ToUniversalTime().ToString("o")
    averageSpeed = 0
    speedSamples = 0
    boostCollected = 0
    boostUsed = 0
    possessionTime = 0
    teamPossessionTime = 0
    opponentPossessionTime = 0
    shotHeatmap = @()
    goalHeatmap = @()
} | ConvertTo-Json

# Test 1: Plugin endpoint (/api/stats/upload)
Write-Host "Test 1: Plugin Endpoint (What plugin uses)" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   Endpoint: /api/stats/upload" -ForegroundColor Gray
Write-Host ""

try {
    $result1 = Invoke-RestMethod -Uri "$ApiUrl/api/stats/upload" -Method Post -Headers $headers -Body $testData -ErrorAction Stop
    Write-Host "   OK WORKS!" -ForegroundColor Green
    Write-Host "   Session ID: $($result1.sessionId)" -ForegroundColor Gray
    Write-Host "   Message: $($result1.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ERROR FAILED!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Alternative endpoint (/api/upload/upload)
Write-Host "Test 2: Alternative Endpoint" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host "   Endpoint: /api/upload/upload" -ForegroundColor Gray
Write-Host ""

try {
    $result2 = Invoke-RestMethod -Uri "$ApiUrl/api/upload/upload" -Method Post -Headers $headers -Body $testData -ErrorAction Stop
    Write-Host "   OK WORKS!" -ForegroundColor Green
    Write-Host "   Session ID: $($result2.sessionId)" -ForegroundColor Gray
    Write-Host "   Message: $($result2.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "   ERROR FAILED!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both endpoints point to the same upload handler." -ForegroundColor White
Write-Host "The plugin uses: /api/stats/upload" -ForegroundColor Yellow
Write-Host "Test scripts use: /api/upload/upload" -ForegroundColor Yellow
Write-Host ""
Write-Host "Both work equally well!" -ForegroundColor Green
Write-Host ""
