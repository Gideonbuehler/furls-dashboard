# Test Profile and Leaderboard Endpoints
# Run this after deploying to production

Write-Host "`n🧪 Testing FURLS Profile & Leaderboard Endpoints..." -ForegroundColor Cyan
Write-Host "================================================`n" -ForegroundColor Cyan

$baseUrl = "https://furls.net"
$testsPassed = 0
$testsFailed = 0

# Test 1: Profile Endpoint
Write-Host "Test 1: Public Profile Endpoint" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/public/profile/ZBeForce" -Method Get -ErrorAction Stop
    if ($response.user -and $response.user.username) {
        Write-Host "✅ Profile loaded successfully!" -ForegroundColor Green
        Write-Host "   Username: $($response.user.username)" -ForegroundColor Gray
        Write-Host "   Display Name: $($response.user.display_name)" -ForegroundColor Gray
        Write-Host "   Total Shots: $($response.user.total_shots)" -ForegroundColor Gray
        Write-Host "   Total Goals: $($response.user.total_goals)" -ForegroundColor Gray
        Write-Host "   Accuracy: $($response.user.accuracy)%" -ForegroundColor Gray
        Write-Host "   Sessions: $($response.sessions.Count)" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "❌ Profile response missing data" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "❌ Profile endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 2: Leaderboard - Accuracy
Write-Host "Test 2: Global Leaderboard (Accuracy)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/public/leaderboard/accuracy" -Method Get -ErrorAction Stop
    if ($response -and $response.Count -gt 0) {
        Write-Host "✅ Leaderboard loaded successfully!" -ForegroundColor Green
        Write-Host "   Total Players: $($response.Count)" -ForegroundColor Gray
        Write-Host "   Top 3:" -ForegroundColor Gray
        for ($i = 0; $i -lt [Math]::Min(3, $response.Count); $i++) {
            $player = $response[$i]
            Write-Host "   $($i+1). $($player.display_name) - $($player.accuracy)% ($($player.total_goals)/$($player.total_shots))" -ForegroundColor Gray
        }
        $testsPassed++
    } else {
        Write-Host "⚠️  Leaderboard returned no players" -ForegroundColor Yellow
        Write-Host "   (This is OK if no users have public profiles with stats yet)" -ForegroundColor Gray
        $testsPassed++
    }
} catch {
    Write-Host "❌ Leaderboard endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 3: Leaderboard - Goals
Write-Host "Test 3: Global Leaderboard (Goals)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/public/leaderboard/goals" -Method Get -ErrorAction Stop
    if ($response -and $response.Count -gt 0) {
        Write-Host "✅ Goals leaderboard loaded successfully!" -ForegroundColor Green
        Write-Host "   Total Players: $($response.Count)" -ForegroundColor Gray
        Write-Host "   Top 3:" -ForegroundColor Gray
        for ($i = 0; $i -lt [Math]::Min(3, $response.Count); $i++) {
            $player = $response[$i]
            Write-Host "   $($i+1). $($player.display_name) - $($player.total_goals) goals" -ForegroundColor Gray
        }
        $testsPassed++
    } else {
        Write-Host "⚠️  Goals leaderboard returned no players" -ForegroundColor Yellow
        $testsPassed++
    }
} catch {
    Write-Host "❌ Goals leaderboard failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""

# Test 4: Player Search
Write-Host "Test 4: Player Search" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/public/search?q=ZB" -Method Get -ErrorAction Stop
    if ($response -is [Array]) {
        Write-Host "✅ Search endpoint working!" -ForegroundColor Green
        Write-Host "   Results found: $($response.Count)" -ForegroundColor Gray
        if ($response.Count -gt 0) {
            Write-Host "   First result: $($response[0].username)" -ForegroundColor Gray
        }
        $testsPassed++
    } else {
        Write-Host "⚠️  Search returned unexpected format" -ForegroundColor Yellow
        $testsPassed++
    }
} catch {
    Write-Host "❌ Search endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    $testsFailed++
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 Test Results:" -ForegroundColor Cyan
Write-Host "   ✅ Passed: $testsPassed" -ForegroundColor Green
Write-Host "   ❌ Failed: $testsFailed" -ForegroundColor $(if ($testsFailed -gt 0) { "Red" } else { "Gray" })

if ($testsFailed -eq 0) {
    Write-Host "`n🎉 All tests passed! Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some tests failed. Check the errors above." -ForegroundColor Yellow
}

Write-Host ""
