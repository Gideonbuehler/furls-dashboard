# User Upload Diagnostic Script
param(
    [string]$ApiUrl = "https://furls.net"
)

Write-Host "`n" -NoNewline
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  FURLS User Upload Issue Diagnostic" -ForegroundColor Cyan  
Write-Host "  Run this with each affected user to find the problem" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing against: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

# Test 1: Server Health
Write-Host "Test 1: Server Health Check" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

try {
    $testUrl = $ApiUrl + '/api/public/leaderboard/shots?page=1&limit=1'
    $health = Invoke-RestMethod -Uri $testUrl -Method Get -TimeoutSec 10
    Write-Host "OK Server is responding" -ForegroundColor Green
    Write-Host "   Status: Online" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR Server is NOT responding!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "CRITICAL: Server is down or unreachable!" -ForegroundColor Red
    Write-Host ""
    exit
}

# Test 2: Check if user has API key
Write-Host "Test 2: User API Key Test" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have the affected user do this:" -ForegroundColor Yellow
Write-Host "   1. Login at $ApiUrl" -ForegroundColor White
Write-Host "   2. Click Settings tab" -ForegroundColor White
Write-Host "   3. Look at the API Key section" -ForegroundColor White
Write-Host ""

Write-Host "Does the user see an API key? (y/n): " -ForegroundColor Yellow -NoNewline
$hasKey = Read-Host

if ($hasKey -ne 'y') {
    Write-Host ""
    Write-Host "PROBLEM FOUND: User has NO API KEY!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "   Run this SQL query on your PostgreSQL database:" -ForegroundColor White
    Write-Host ""
    
    Write-Host "   -- Check all users without API keys" -ForegroundColor Gray
    Write-Host "   SELECT id, username, email, created_at" -ForegroundColor Gray
    Write-Host "   FROM users" -ForegroundColor Gray
    Write-Host "   WHERE api_key IS NULL OR api_key = '';" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   -- Generate API keys for ALL users without one" -ForegroundColor Gray
    Write-Host "   UPDATE users" -ForegroundColor Gray
    Write-Host "   SET api_key = encode(gen_random_bytes(32), 'hex')" -ForegroundColor Gray
    Write-Host "   WHERE api_key IS NULL OR api_key = '';" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "   -- Verify the update" -ForegroundColor Gray
    Write-Host "   SELECT username, LENGTH(api_key) as key_length," -ForegroundColor Gray
    Write-Host "          SUBSTRING(api_key, 1, 8) || '...' as key_preview" -ForegroundColor Gray
    Write-Host "   FROM users WHERE api_key IS NOT NULL;" -ForegroundColor Gray
    Write-Host ""

    Write-Host "   After running the SQL:" -ForegroundColor White
    Write-Host "   1. Have user LOGOUT" -ForegroundColor White
    Write-Host "   2. Have user LOGIN again" -ForegroundColor White
    Write-Host "   3. Go to Settings - API key should now appear" -ForegroundColor White
    Write-Host ""
    Write-Host "   Then re-run this script to continue testing." -ForegroundColor White
    Write-Host ""
    exit
}

# Test 3: Get and validate API key
Write-Host ""
Write-Host "Paste the user's API key below:" -ForegroundColor Yellow
Write-Host "   (It should be a 64-character hex string)" -ForegroundColor Gray
Write-Host ""
$apiKey = Read-Host "API Key"

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host ""
    Write-Host "ERROR No API key provided. Exiting." -ForegroundColor Red
    Write-Host ""
    exit
}

$apiKey = $apiKey.Trim()

Write-Host ""
Write-Host "Test 3: API Key Validation" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Key Length: $($apiKey.Length) chars " -NoNewline -ForegroundColor Gray

if ($apiKey.Length -ne 64) {
    Write-Host "WRONG! (Expected 64)" -ForegroundColor Red
    Write-Host ""
    Write-Host "PROBLEM: API key has wrong length!" -ForegroundColor Red
    Write-Host "   This usually means:" -ForegroundColor Yellow
    Write-Host "   - Extra spaces before/after the key" -ForegroundColor White
    Write-Host "   - Key was truncated during copy" -ForegroundColor White
    Write-Host "   - User copied something else" -ForegroundColor White
    Write-Host ""
    Write-Host "   Tell user to copy the key again carefully!" -ForegroundColor White
    Write-Host ""
    exit
} else {
    Write-Host "OK Correct" -ForegroundColor Green
}

Write-Host "   Key Preview: $($apiKey.Substring(0, 8))..." -ForegroundColor Gray
Write-Host ""

# Test 4: Test authentication
Write-Host "Test 4: API Key Authentication" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $apiKey"
        "Content-Type" = "application/json"
    }
    
    $authTest = Invoke-RestMethod -Uri "$ApiUrl/api/upload/test-auth" -Method Get -Headers $headers -ErrorAction Stop
    Write-Host "OK API Key is VALID!" -ForegroundColor Green
    Write-Host "   Username: $($authTest.username)" -ForegroundColor Gray
    Write-Host "   User ID: $($authTest.userId)" -ForegroundColor Gray
    Write-Host ""
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR API Key is INVALID!" -ForegroundColor Red
    Write-Host "   Status Code: $statusCode" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    Write-Host "PROBLEM: API key doesn't exist in database!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "   This key is not in the database. Either:" -ForegroundColor White
    Write-Host "   1. User copied wrong key" -ForegroundColor White
    Write-Host "   2. Database was reset" -ForegroundColor White
    Write-Host "   3. User needs to regenerate key" -ForegroundColor White
    Write-Host ""
    Write-Host "   Have user click Regenerate API Key in Settings" -ForegroundColor White
    Write-Host "   Then copy the NEW key and test again." -ForegroundColor White
    Write-Host ""
    exit
}

# Test 5: Test upload endpoint
Write-Host "Test 5: Upload Endpoint Test" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

try {
    $testData = @{
        shots = 5
        goals = 3
        gameTime = 180
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
    
    $uploadTest = Invoke-RestMethod -Uri "$ApiUrl/api/upload/upload" -Method Post -Headers $headers -Body $testData -ErrorAction Stop
    Write-Host "OK Upload Successful!" -ForegroundColor Green
    Write-Host "   Session ID: $($uploadTest.sessionId)" -ForegroundColor Gray
    Write-Host "   Message: $($uploadTest.message)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR Upload Failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "PROBLEM: Upload endpoint is broken!" -ForegroundColor Red
    Write-Host "   This is a SERVER issue, not a user issue." -ForegroundColor Yellow
    Write-Host "   Check server logs for errors." -ForegroundColor Yellow
    Write-Host ""
    exit
}

# Test 6: Verify session appears in dashboard
Write-Host "Test 6: Verify Session in Dashboard" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have the user:" -ForegroundColor Yellow
Write-Host "   1. Go to $ApiUrl" -ForegroundColor White
Write-Host "   2. Login" -ForegroundColor White
Write-Host "   3. Check Dashboard for new session" -ForegroundColor White
Write-Host "   4. Should see a session with 5 shots, 3 goals" -ForegroundColor White
Write-Host ""

Write-Host "Does the user see the test session? (y/n): " -ForegroundColor Yellow -NoNewline
$seesSession = Read-Host

if ($seesSession -ne 'y') {
    Write-Host ""
    Write-Host "PROBLEM: Session uploaded but not visible!" -ForegroundColor Red
    Write-Host "   This is a DISPLAY issue, not an upload issue." -ForegroundColor Yellow
    Write-Host "   The upload works, but dashboard is not showing it." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "   1. Have user refresh the page (Ctrl+F5)" -ForegroundColor White
    Write-Host "   2. Check browser console for errors (F12)" -ForegroundColor White
    Write-Host "   3. Check server logs for database errors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "OK TEST SESSION VISIBLE!" -ForegroundColor Green
    Write-Host ""
}

# Additional plugin diagnostic step
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "PLUGIN CONFIGURATION CHECK" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The manual test upload worked! This confirms:" -ForegroundColor Green
Write-Host "   OK Server is running correctly" -ForegroundColor Green
Write-Host "   OK API key is valid" -ForegroundColor Green
Write-Host "   OK Upload endpoint works" -ForegroundColor Green
Write-Host ""
Write-Host "If in-game uploads don't work, it's a PLUGIN CONFIGURATION issue." -ForegroundColor Yellow
Write-Host ""

# Plugin configuration check
Write-Host "Have the user open BakkesMod console (F6 in-game) and type these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Command 1:" -ForegroundColor Cyan
Write-Host "   furls_server_url" -ForegroundColor White
Write-Host "   Expected output: $ApiUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "Command 2:" -ForegroundColor Cyan
Write-Host "   furls_api_key" -ForegroundColor White
Write-Host "   Expected output: $($apiKey.Substring(0,8))..." -ForegroundColor Gray
Write-Host ""
Write-Host "Command 3:" -ForegroundColor Cyan
Write-Host "   furls_enable_upload" -ForegroundColor White
Write-Host "   Expected output: 1" -ForegroundColor Gray
Write-Host ""
Write-Host "Command 4:" -ForegroundColor Cyan
Write-Host "   plugin list" -ForegroundColor White
Write-Host "   Expected: Should see 'FURLS' in the list" -ForegroundColor Gray
Write-Host ""

Write-Host "Are all four checks correct? (y/n): " -ForegroundColor Yellow -NoNewline
$configCorrect = Read-Host

if ($configCorrect -ne 'y') {
    Write-Host ""
    Write-Host "PROBLEM: Plugin configuration is WRONG!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUTION: Have user run these commands in BakkesMod console:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   writecvar furls_server_url `"$ApiUrl`"" -ForegroundColor White
    Write-Host "   writecvar furls_api_key `"$apiKey`"" -ForegroundColor White
    Write-Host "   writecvar furls_enable_upload `"1`"" -ForegroundColor White
    Write-Host ""
    Write-Host "Then restart Rocket League and test again." -ForegroundColor Yellow
    Write-Host ""
    exit
}

# In-game testing instructions
Write-Host ""
Write-Host "OK CONFIGURATION IS CORRECT!" -ForegroundColor Green
Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "IN-GAME UPLOAD TEST" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Have user do this test:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Launch Rocket League (if not already running)" -ForegroundColor White
Write-Host "2. Press F6 to open BakkesMod console" -ForegroundColor White
Write-Host "3. Keep console OPEN on second monitor (or visible)" -ForegroundColor White
Write-Host "4. Start Freeplay training" -ForegroundColor White
Write-Host "5. Take 5-10 shots at the goal" -ForegroundColor White
Write-Host "6. Press ESC and forfeit/exit the match" -ForegroundColor White
Write-Host "7. Immediately look at console for [FURLS] messages" -ForegroundColor White
Write-Host ""
Write-Host "What messages do they see in console?" -ForegroundColor Yellow
Write-Host ""
Write-Host "A. No [FURLS] messages at all" -ForegroundColor White
Write-Host "B. [FURLS] Upload failed: Invalid API key (401)" -ForegroundColor White
Write-Host "C. [FURLS] Upload failed: Endpoint not found (404)" -ForegroundColor White
Write-Host "D. [FURLS] Stats uploaded successfully! (200)" -ForegroundColor White
Write-Host "E. Other error message" -ForegroundColor White
Write-Host ""
Write-Host "Enter A, B, C, D, or E: " -ForegroundColor Yellow -NoNewline
$consoleMessage = Read-Host

Write-Host ""

switch ($consoleMessage.ToUpper()) {
    "A" {
        Write-Host "PROBLEM: Match end event is not firing!" -ForegroundColor Red
        Write-Host ""
        Write-Host "This means:" -ForegroundColor Yellow
        Write-Host "   - Plugin isn't detecting match end" -ForegroundColor White
        Write-Host "   - OR stats don't meet upload threshold" -ForegroundColor White
        Write-Host "   - OR upload is silently failing" -ForegroundColor White
        Write-Host ""
        Write-Host "SOLUTION:" -ForegroundColor Yellow
        Write-Host "   1. Verify user took SHOTS (not just driving around)" -ForegroundColor White
        Write-Host "   2. Try a longer match (60+ seconds)" -ForegroundColor White
        Write-Host "   3. Check if other plugins work (test if BM hooks work)" -ForegroundColor White
        Write-Host "   4. Unload and reload FURLS plugin:" -ForegroundColor White
        Write-Host "      plugin unload furls" -ForegroundColor Gray
        Write-Host "      plugin load furls" -ForegroundColor Gray
        Write-Host ""
    }
    "B" {
        Write-Host "PROBLEM: API key is WRONG in plugin!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Even though the key works in PowerShell, the plugin has a different key." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SOLUTION:" -ForegroundColor Yellow
        Write-Host "   1. Have user run this in BakkesMod console:" -ForegroundColor White
        Write-Host "      writecvar furls_api_key `"$apiKey`"" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   2. Verify it was saved:" -ForegroundColor White
        Write-Host "      furls_api_key" -ForegroundColor Gray
        Write-Host "      Should now show: $($apiKey.Substring(0,8))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "   3. Test upload again in freeplay" -ForegroundColor White
        Write-Host ""
    }
    "C" {
        Write-Host "PROBLEM: Server URL is WRONG!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Plugin is trying to reach wrong server or wrong path." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "SOLUTION:" -ForegroundColor Yellow
        Write-Host "   1. Have user run this in BakkesMod console:" -ForegroundColor White
        Write-Host "      writecvar furls_server_url `"$ApiUrl`"" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   2. Verify it was saved:" -ForegroundColor White
        Write-Host "      furls_server_url" -ForegroundColor Gray
        Write-Host "      Should show: $ApiUrl" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   3. IMPORTANT: NO trailing slash!" -ForegroundColor Red
        Write-Host "      WRONG: $ApiUrl/" -ForegroundColor Red
        Write-Host "      RIGHT: $ApiUrl" -ForegroundColor Green
        Write-Host ""
        Write-Host "   4. Test upload again in freeplay" -ForegroundColor White
        Write-Host ""
    }
    "D" {
        Write-Host "SUCCESS! Upload is working!" -ForegroundColor Green
        Write-Host ""
        Write-Host "OK The plugin is uploading correctly!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Have user check dashboard:" -ForegroundColor Yellow
        Write-Host "   1. Go to $ApiUrl" -ForegroundColor White
        Write-Host "   2. Login" -ForegroundColor White
        Write-Host "   3. Check Dashboard tab" -ForegroundColor White
        Write-Host "   4. Should see the freeplay session" -ForegroundColor White
        Write-Host ""
    }
    "E" {
        Write-Host "OTHER ERROR DETECTED" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Please copy the exact error message from BakkesMod console:" -ForegroundColor Yellow
        Write-Host ""
        $errorMessage = Read-Host "Error message"
        Write-Host ""
        Write-Host "Error received: $errorMessage" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Common error messages and solutions:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   'Failed to connect to server'" -ForegroundColor White
        Write-Host "   → Check Windows Firewall" -ForegroundColor Gray
        Write-Host "   → Check antivirus isn't blocking" -ForegroundColor Gray
        Write-Host "   → Test: Test-NetConnection -ComputerName furls.net -Port 443" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   'Server unavailable (503)'" -ForegroundColor White
        Write-Host "   → Server is temporarily down" -ForegroundColor Gray
        Write-Host "   → Try again in a few minutes" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   'Server error (5xx)'" -ForegroundColor White
        Write-Host "   → Backend database issue" -ForegroundColor Gray
        Write-Host "   → Check server logs" -ForegroundColor Gray
        Write-Host ""
    }
    default {
        Write-Host "Invalid option selected." -ForegroundColor Red
        Write-Host "Please run the script again and choose A, B, C, D, or E." -ForegroundColor Yellow
        Write-Host ""
    }
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "PLUGIN UPLOAD FLOW EXPLAINED" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "How the plugin upload works:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Match ends (you forfeit or timer expires)" -ForegroundColor White
Write-Host "2. Plugin checks: shots > 0 OR goals > 0 OR gameTime > 10s" -ForegroundColor White
Write-Host "3. If conditions met, plugin makes HTTP POST request:" -ForegroundColor White
Write-Host "   URL: $ApiUrl/api/stats/upload" -ForegroundColor Gray
Write-Host "   Headers: Authorization: Bearer {your_api_key}" -ForegroundColor Gray
Write-Host "   Body: JSON with shots, goals, time, etc." -ForegroundColor Gray
Write-Host ""
Write-Host "4. Server responds with status code:" -ForegroundColor White
Write-Host "   200 = Success" -ForegroundColor Green
Write-Host "   401 = Invalid API key" -ForegroundColor Red
Write-Host "   404 = Wrong server URL" -ForegroundColor Red
Write-Host "   503 = Server unavailable" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Plugin logs result to BakkesMod console" -ForegroundColor White
Write-Host ""

# Summary
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "DIAGNOSTIC SUMMARY" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

if ($seesSession -eq 'y') {
    Write-Host ""
    Write-Host "OK ALL TESTS PASSED!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The user setup is CORRECT. Their uploads should work." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Have user open BakkesMod plugin config:" -ForegroundColor White
    Write-Host "   %APPDATA%\bakkesmod\bakkesmod\cfg\furls.cfg" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Verify the config file contains:" -ForegroundColor White
    Write-Host "   furls_api_key `"$($apiKey.Substring(0, 8))...`"" -ForegroundColor Gray
    Write-Host "   furls_server_url `"$ApiUrl`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. If config is correct but still not working:" -ForegroundColor White
    Write-Host "   - Check if BakkesMod is loading the plugin" -ForegroundColor White
    Write-Host "   - Open BakkesMod console (F6) and type: furls_test_connection" -ForegroundColor White
    Write-Host "   - Check BakkesMod logs for errors" -ForegroundColor White
    Write-Host ""
    Write-Host "4. Test in-game:" -ForegroundColor White
    Write-Host "   - Play freeplay training" -ForegroundColor White
    Write-Host "   - Take 5-10 shots" -ForegroundColor White
    Write-Host "   - Exit match" -ForegroundColor White
    Write-Host "   - Check dashboard for new session" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "WARNING: TESTS PASSED BUT SESSION NOT VISIBLE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "This means:" -ForegroundColor White
    Write-Host "- OK API key works" -ForegroundColor Green
    Write-Host "- OK Upload endpoint works" -ForegroundColor Green
    Write-Host "- ERROR Dashboard display has an issue" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check browser console and server logs for errors." -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Diagnostic Complete!" -ForegroundColor Cyan
Write-Host ""
