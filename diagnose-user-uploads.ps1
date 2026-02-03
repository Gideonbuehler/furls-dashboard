# 🔍 FURLS User Upload Diagnostic Tool
# This script helps diagnose why other users can't upload stats

param(
    [string]$ApiUrl = "https://furls.net"
)

Write-Host "`n🔍 FURLS User Upload Diagnostics" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Function to test API key
function Test-ApiKey {
    param([string]$apiKey)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/upload/test-auth" -Method Get -Headers $headers -ErrorAction Stop
        return @{
            Success = $true
            Message = "✅ API key is VALID"
            Username = $response.username
            UserId = $response.userId
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        return @{
            Success = $false
            Message = "❌ API key is INVALID"
            StatusCode = $statusCode
            Error = $_.Exception.Message
        }
    }
}

# Function to test upload endpoint
function Test-Upload {
    param([string]$apiKey)
    
    try {
        $headers = @{
            "Authorization" = "Bearer $apiKey"
            "Content-Type" = "application/json"
        }
        
        $testData = @{
            shots = 10
            goals = 5
            gameTime = 300
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
        
        $response = Invoke-RestMethod -Uri "$ApiUrl/api/upload/upload" -Method Post -Headers $headers -Body $testData -ErrorAction Stop
        return @{
            Success = $true
            Message = "✅ Upload endpoint WORKS"
            SessionId = $response.sessionId
        }
    } catch {
        return @{
            Success = $false
            Message = "❌ Upload endpoint FAILED"
            Error = $_.Exception.Message
        }
    }
}

Write-Host "📋 Instructions for Testing Users:" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow
Write-Host "1. Ask each user to login at: $ApiUrl" -ForegroundColor White
Write-Host "2. Have them go to Settings tab" -ForegroundColor White
Write-Host "3. Copy their API key" -ForegroundColor White
Write-Host "4. Paste it below when prompted`n" -ForegroundColor White

Write-Host "💡 Common Issues to Check:" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow
Write-Host "• API key has extra spaces (copy issue)" -ForegroundColor White
Write-Host "• Plugin config file has wrong API key" -ForegroundColor White
Write-Host "• Plugin pointing to wrong server URL" -ForegroundColor White
Write-Host "• Firewall blocking plugin uploads" -ForegroundColor White
Write-Host "• User created account BEFORE API key migration`n" -ForegroundColor White

# Test loop
$testNumber = 1
while ($true) {
    Write-Host "`n🧪 Test #$testNumber - Enter API Key to Test" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    $apiKey = Read-Host "Paste API key (or 'q' to quit)"
    
    if ($apiKey -eq 'q' -or $apiKey -eq '') { break }
    
    # Trim whitespace
    $apiKey = $apiKey.Trim()
    
    Write-Host "`n🔍 Testing API Key: $($apiKey.Substring(0, [Math]::Min(8, $apiKey.Length)))..." -ForegroundColor Gray
    Write-Host "   Length: $($apiKey.Length) characters" -ForegroundColor Gray
    
    # Expected length is 64 chars (32 bytes in hex)
    if ($apiKey.Length -ne 64) {
        Write-Host "   ⚠️  WARNING: Expected 64 characters, got $($apiKey.Length)" -ForegroundColor Yellow
    }
    
    Write-Host "`n📡 Step 1: Testing API Key Authentication..." -ForegroundColor Cyan
    $authTest = Test-ApiKey -apiKey $apiKey
    
    if ($authTest.Success) {
        Write-Host "$($authTest.Message)" -ForegroundColor Green
        Write-Host "   Username: $($authTest.Username)" -ForegroundColor Green
        Write-Host "   User ID: $($authTest.UserId)" -ForegroundColor Green
        
        Write-Host "`n📡 Step 2: Testing Upload Endpoint..." -ForegroundColor Cyan
        $uploadTest = Test-Upload -apiKey $apiKey
        
        if ($uploadTest.Success) {
            Write-Host "$($uploadTest.Message)" -ForegroundColor Green
            Write-Host "   Session ID: $($uploadTest.SessionId)" -ForegroundColor Green
            Write-Host "`n✅ ALL TESTS PASSED - User's setup is CORRECT!" -ForegroundColor Green
            Write-Host "   If plugin still doesn't work, check:" -ForegroundColor Yellow
            Write-Host "   1. Plugin config file location" -ForegroundColor Yellow
            Write-Host "   2. Plugin server URL setting" -ForegroundColor Yellow
            Write-Host "   3. Rocket League/BakkesMod running as admin" -ForegroundColor Yellow
        } else {
            Write-Host "$($uploadTest.Message)" -ForegroundColor Red
            Write-Host "   Error: $($uploadTest.Error)" -ForegroundColor Red
            Write-Host "`n❌ Upload failed but auth worked - Contact support!" -ForegroundColor Red
        }
    } else {
        Write-Host "$($authTest.Message)" -ForegroundColor Red
        Write-Host "   Status Code: $($authTest.StatusCode)" -ForegroundColor Red
        Write-Host "`n❌ PROBLEM FOUND: API Key is Invalid!" -ForegroundColor Red
        Write-Host "`n🔧 Troubleshooting Steps:" -ForegroundColor Yellow
        Write-Host "1. Have user logout and login again" -ForegroundColor White
        Write-Host "2. Go to Settings tab" -ForegroundColor White
        Write-Host "3. Copy API key again (watch for extra spaces!)" -ForegroundColor White
        Write-Host "4. If still no API key shown, user needs to re-register" -ForegroundColor White
    }
    
    $testNumber++
}

Write-Host "`n🏁 Diagnostics Complete!" -ForegroundColor Cyan
Write-Host "`n📊 Quick Database Check (Run on server):" -ForegroundColor Yellow
Write-Host @"
SELECT username, 
       CASE WHEN api_key IS NULL THEN '❌ NO KEY' ELSE '✅ HAS KEY' END as has_key,
       CASE WHEN last_active IS NULL THEN '❌ NEVER UPLOADED' ELSE '✅ UPLOADED' END as uploaded,
       last_active,
       total_sessions,
       total_shots
FROM users 
ORDER BY created_at DESC;
"@ -ForegroundColor Gray

Write-Host "`n📝 Plugin Config File Locations:" -ForegroundColor Yellow
Write-Host "Windows: %APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg" -ForegroundColor White
Write-Host "Should contain:" -ForegroundColor White
Write-Host "  furls_api_key ""[64-character-hex-key]""" -ForegroundColor Gray
Write-Host "  furls_server_url ""https://furls.net""" -ForegroundColor Gray
