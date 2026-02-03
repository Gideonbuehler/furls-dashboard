# Debug Friends Leaderboard Issue
# This script helps diagnose why friends-only leaderboard shows no data

param(
    [string]$ApiUrl = "https://furls.net"
)

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "  Friends Leaderboard Diagnostic" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Get user token
Write-Host "You need to be logged in. Please provide your auth token:" -ForegroundColor Yellow
Write-Host "   1. Open browser console (F12) on $ApiUrl" -ForegroundColor Gray
Write-Host "   2. Type: localStorage.getItem('token')" -ForegroundColor Gray
Write-Host "   3. Copy the token (without quotes)" -ForegroundColor Gray
Write-Host ""

$token = Read-Host "Your auth token"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "ERROR No token provided. Exiting." -ForegroundColor Red
    exit
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host ""
Write-Host "Test 1: Check Your Profile" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

try {
    $profile = Invoke-RestMethod -Uri "$ApiUrl/api/auth/me" -Headers $headers -ErrorAction Stop
    Write-Host "OK Logged in as: $($profile.username)" -ForegroundColor Green
    Write-Host "   User ID: $($profile.id)" -ForegroundColor Gray
    Write-Host "   Total Sessions: $($profile.total_sessions)" -ForegroundColor Gray
    Write-Host "   Total Shots: $($profile.total_shots)" -ForegroundColor Gray
    Write-Host "   Total Goals: $($profile.total_goals)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR Invalid token!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    exit
}

Write-Host "Test 2: Check Friends List" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host ""

try {
    $friends = Invoke-RestMethod -Uri "$ApiUrl/api/friends" -Headers $headers -ErrorAction Stop
    
    if ($friends.Count -eq 0) {
        Write-Host "WARNING You have ZERO friends!" -ForegroundColor Yellow
        Write-Host "   This is why friends leaderboard is empty." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "   Add friends first, then check leaderboard again." -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "OK You have $($friends.Count) friend(s):" -ForegroundColor Green
        Write-Host ""
        foreach ($friend in $friends) {
            $friendUser = if ($friend.user_id -eq $profile.id) { $friend.friend } else { $friend.user }
            Write-Host "   Friend: $($friendUser.username)" -ForegroundColor White
            Write-Host "      Sessions: $($friendUser.total_sessions)" -ForegroundColor Gray
            Write-Host "      Shots: $($friendUser.total_shots)" -ForegroundColor Gray
            Write-Host "      Goals: $($friendUser.total_goals)" -ForegroundColor Gray
            Write-Host ""
        }
    }
} catch {
    Write-Host "ERROR Failed to get friends list!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test 3: Check Friends Leaderboard (Accuracy)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

try {
    $leaderboard = Invoke-RestMethod -Uri "$ApiUrl/api/user/stats/leaderboard?type=friends&stat=accuracy" -Headers $headers -ErrorAction Stop
    
    if ($leaderboard.Count -eq 0) {
        Write-Host "ERROR Leaderboard is EMPTY!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Possible reasons:" -ForegroundColor Yellow
        Write-Host "   1. You have no friends" -ForegroundColor White
        Write-Host "   2. Neither you nor your friends have stats (shots = 0)" -ForegroundColor White
        Write-Host "   3. Database query is failing" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "OK Leaderboard has $($leaderboard.Count) entries:" -ForegroundColor Green
        Write-Host ""
        foreach ($entry in $leaderboard) {
            $accuracy = if ($entry.accuracy) { $entry.accuracy } else { $entry.avg_accuracy }
            Write-Host "   $($entry.username)" -ForegroundColor White
            Write-Host "      Accuracy: $accuracy%" -ForegroundColor Gray
            Write-Host "      Shots: $($entry.total_shots)" -ForegroundColor Gray
            Write-Host "      Goals: $($entry.total_goals)" -ForegroundColor Gray
            Write-Host "      Sessions: $($entry.total_sessions)" -ForegroundColor Gray
            Write-Host ""
        }
    }
} catch {
    Write-Host "ERROR Failed to get leaderboard!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test 4: Check Global Leaderboard (for comparison)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

try {
    $global = Invoke-RestMethod -Uri "$ApiUrl/api/public/leaderboard/accuracy" -Headers $headers -ErrorAction Stop
    
    Write-Host "OK Global leaderboard has $($global.Count) entries" -ForegroundColor Green
    Write-Host ""
    
    if ($global.Count -gt 0) {
        Write-Host "Top 3 global players:" -ForegroundColor White
        for ($i = 0; $i -lt [Math]::Min(3, $global.Count); $i++) {
            $entry = $global[$i]
            $accuracy = if ($entry.accuracy) { $entry.accuracy } else { $entry.avg_accuracy }
            Write-Host "   $($i + 1). $($entry.username) - $accuracy%" -ForegroundColor Gray
        }
        Write-Host ""
    }
} catch {
    Write-Host "ERROR Failed to get global leaderboard!" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Summary & Solutions" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

if ($friends.Count -eq 0) {
    Write-Host "PROBLEM: You have NO FRIENDS" -ForegroundColor Red
    Write-Host ""
    Write-Host "The friends leaderboard only shows you and your friends." -ForegroundColor White
    Write-Host "Since you have no friends, it only shows you." -ForegroundColor White
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "   1. Go to $ApiUrl" -ForegroundColor White
    Write-Host "   2. Click 'Friends' tab" -ForegroundColor White
    Write-Host "   3. Search for users and send friend requests" -ForegroundColor White
    Write-Host "   4. Wait for them to accept" -ForegroundColor White
    Write-Host "   5. Check leaderboard again" -ForegroundColor White
    Write-Host ""
} elseif ($profile.total_shots -eq 0) {
    Write-Host "PROBLEM: You have ZERO SHOTS" -ForegroundColor Red
    Write-Host ""
    Write-Host "The leaderboard filters out users with 0 shots." -ForegroundColor White
    Write-Host ""
    Write-Host "SOLUTION:" -ForegroundColor Yellow
    Write-Host "   1. Play some matches in Rocket League" -ForegroundColor White
    Write-Host "   2. Make sure plugin is uploading (see testUsers.ps1)" -ForegroundColor White
    Write-Host "   3. Check leaderboard again" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "OK You have friends AND stats!" -ForegroundColor Green
    Write-Host ""
    Write-Host "If leaderboard is still empty, check:" -ForegroundColor Yellow
    Write-Host "   1. Do your friends have stats? (shots > 0)" -ForegroundColor White
    Write-Host "   2. Check browser console for errors (F12)" -ForegroundColor White
    Write-Host "   3. Check server logs" -ForegroundColor White
    Write-Host ""
}

Write-Host "Diagnostic Complete!" -ForegroundColor Cyan
Write-Host ""
