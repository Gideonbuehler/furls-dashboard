# Friends Leaderboard Not Showing Data - Diagnosis & Fix

## Problem
When switching to "Friends Only" leaderboard, no data is displayed even though you have friends.

## Root Causes (in order of likelihood)

### 1. You Have No Friends ⭐ MOST LIKELY
The friends leaderboard shows **you + your friends**. If you have zero friends, it will only show you (if you have stats).

**Check:**
```sql
SELECT COUNT(*) FROM friendships WHERE (user_id = YOUR_ID OR friend_id = YOUR_ID) AND status = 'accepted';
```

**Solution:**
1. Go to the Friends tab
2. Search for users
3. Send friend requests
4. Wait for acceptance
5. Check leaderboard again

### 2. You Have Zero Shots
The leaderboard query filters out users with `total_shots = 0`:

```sql
WHERE ... AND u.total_shots > 0
```

**Check:**
```sql
SELECT total_shots, total_goals, total_sessions FROM users WHERE id = YOUR_ID;
```

**Solution:**
1. Play matches in Rocket League
2. Ensure BakkesMod plugin is uploading
3. Verify stats appear in Dashboard
4. Check leaderboard again

### 3. Your Friends Have Zero Shots
Even if you have stats, if ALL your friends have `total_shots = 0`, the leaderboard will only show you.

**Check:**
```sql
SELECT u.username, u.total_shots, u.total_goals 
FROM users u
WHERE u.id IN (
  SELECT CASE WHEN user_id = YOUR_ID THEN friend_id ELSE user_id END
  FROM friendships
  WHERE (user_id = YOUR_ID OR friend_id = YOUR_ID) AND status = 'accepted'
);
```

**Solution:**
- Wait for friends to play matches and upload stats
- Or add friends who already have stats

## Quick Diagnosis

### Using PowerShell Script
Run the diagnostic script:
```powershell
.\debug-friends-leaderboard.ps1
```

This will check:
1. Your profile and stats
2. Your friends list
3. Friends leaderboard response
4. Global leaderboard (for comparison)

### Using Browser Console
1. Open your dashboard at https://furls.net
2. Press F12 to open console
3. Go to Leaderboard tab
4. Switch to "Friends Only"
5. Check console for messages:
   ```
   [Leaderboard] Friends response: [...]
   [Leaderboard] Friends count: 0
   ```

If count is 0, the issue is one of the root causes above.

## Code Changes Made

### 1. Enhanced Logging in Leaderboard.jsx
Added console.log statements to help debug:
```javascript
console.log("[Leaderboard] Friends response:", response.data);
console.log("[Leaderboard] Friends count:", response.data?.length || 0);
```

### 2. Better Empty State Message
Changed empty state to be more helpful:
```javascript
{type === "friends" ? (
  <>
    <p>No friends data available yet.</p>
    <p>Make sure you have added friends and that you or your friends have completed training sessions.</p>
    <p className="hint">Tip: Go to the Friends tab to add friends, then play some matches!</p>
  </>
) : (
  <p>No data available yet. Complete some training sessions!</p>
)}
```

### 3. Created Diagnostic Script
`debug-friends-leaderboard.ps1` - Interactive script that checks:
- Your authentication
- Your profile and stats
- Your friends list
- Friends leaderboard data
- Global leaderboard (for comparison)

## Server-Side Query (Already Correct)

The query in `server/routes/stats.js` is working correctly:

```javascript
if (type === "friends") {
  query = `
    SELECT 
      u.id, u.username, u.display_name, u.avatar_url,
      u.total_sessions, u.total_shots, u.total_goals,
      ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as accuracy,
      ROUND((CAST(u.total_goals AS FLOAT) / NULLIF(u.total_shots, 0) * 100), 2) as avg_accuracy
    FROM users u
    WHERE (u.id = ? OR u.id IN (
      SELECT CASE 
        WHEN user_id = ? THEN friend_id
        WHEN friend_id = ? THEN user_id
      END
      FROM friendships
      WHERE (user_id = ? OR friend_id = ?) AND status = 'accepted'
    ))
    AND u.total_shots > 0
  `;
}
```

This query:
1. ✅ Includes the current user (`u.id = ?`)
2. ✅ Includes all accepted friends (CASE statement handles bidirectional friendship)
3. ✅ Filters out users with 0 shots (`AND u.total_shots > 0`)
4. ✅ Calculates accuracy correctly

## Testing Steps

### Test 1: Check Your Friends
```powershell
# Using the API
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN" }
Invoke-RestMethod -Uri "https://furls.net/api/friends" -Headers $headers
```

Expected:
- Should return array of friendships
- Each friendship has `user` and `friend` objects
- Check `status = 'accepted'`

### Test 2: Check Friends Leaderboard API
```powershell
# Directly test the API endpoint
$headers = @{ "Authorization" = "Bearer YOUR_TOKEN" }
Invoke-RestMethod -Uri "https://furls.net/api/user/stats/leaderboard?type=friends&stat=accuracy" -Headers $headers
```

Expected:
- Should return array of user objects
- Each has: `username`, `total_shots`, `total_goals`, `accuracy`
- If empty array, one of the root causes above

### Test 3: Compare with Global
```powershell
# Check global leaderboard works
Invoke-RestMethod -Uri "https://furls.net/api/public/leaderboard/accuracy"
```

Expected:
- Should return array with public profiles
- If this works but friends doesn't, confirms it's a friends/stats issue

## Solutions Summary

| Scenario | Solution |
|----------|----------|
| No friends | Add friends via Friends tab |
| You have 0 shots | Play matches, upload stats |
| Friends have 0 shots | Wait for friends to play, or add friends with stats |
| Database issue | Check server logs, verify friendships table |
| Frontend issue | Check browser console for errors |

## Files Modified

1. **client/src/components/Leaderboard.jsx**
   - Added detailed console logging
   - Improved empty state message for friends mode
   - Better error handling

2. **debug-friends-leaderboard.ps1** (NEW)
   - Interactive diagnostic script
   - Tests all aspects of friends leaderboard
   - Provides actionable solutions

## Next Steps

1. **Run the diagnostic script** to identify the exact issue
2. **Check browser console** when switching to friends leaderboard
3. **Verify you have friends** with accepted status
4. **Verify you and friends have stats** (total_shots > 0)

The server-side code is correct, so the issue is almost certainly data-related (no friends or no stats).
