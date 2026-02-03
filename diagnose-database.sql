-- 🔍 FURLS Database Diagnostic Queries
-- Run these on your PostgreSQL database to diagnose user upload issues

-- 1. Check which users have API keys
SELECT 
    id,
    username,
    email,
    CASE 
        WHEN api_key IS NULL THEN '❌ NO API KEY'
        WHEN api_key = '' THEN '❌ EMPTY API KEY'
        ELSE '✅ HAS API KEY'
    END as api_key_status,
    LENGTH(api_key) as key_length,
    CASE 
        WHEN last_active IS NULL THEN '❌ NEVER UPLOADED'
        ELSE '✅ HAS UPLOADED'
    END as upload_status,
    last_active,
    total_sessions,
    total_shots,
    total_goals,
    created_at
FROM users
ORDER BY created_at DESC;

-- 2. Find users created BEFORE API key migration
SELECT 
    id,
    username,
    created_at,
    api_key IS NULL as missing_api_key,
    last_active IS NULL as never_uploaded
FROM users
WHERE created_at < (
    SELECT MIN(created_at) 
    FROM users 
    WHERE api_key IS NOT NULL
)
ORDER BY created_at DESC;

-- 3. Check recent upload activity
SELECT 
    u.username,
    u.last_active as last_upload,
    u.total_sessions,
    u.total_shots,
    u.total_goals,
    COUNT(s.id) as session_count,
    MAX(s.timestamp) as latest_session
FROM users u
LEFT JOIN sessions s ON u.id = s.user_id
GROUP BY u.id, u.username, u.last_active, u.total_sessions, u.total_shots, u.total_goals
ORDER BY u.last_active DESC NULLS LAST;

-- 4. Find sessions without matching user updates
SELECT 
    s.id as session_id,
    s.user_id,
    u.username,
    s.shots,
    s.goals,
    s.timestamp,
    u.last_active,
    CASE 
        WHEN u.last_active IS NULL THEN '⚠️ USER NEVER MARKED ACTIVE'
        WHEN s.timestamp > u.last_active THEN '⚠️ SESSION NEWER THAN LAST_ACTIVE'
        ELSE '✓ OK'
    END as status
FROM sessions s
JOIN users u ON s.user_id = u.id
ORDER BY s.timestamp DESC
LIMIT 20;

-- 5. Users with sessions but no last_active (data inconsistency)
SELECT 
    u.id,
    u.username,
    u.last_active,
    COUNT(s.id) as session_count,
    MAX(s.timestamp) as latest_session_timestamp
FROM users u
JOIN sessions s ON u.id = s.user_id
WHERE u.last_active IS NULL
GROUP BY u.id, u.username, u.last_active;

-- 6. Summary statistics
SELECT 
    COUNT(*) as total_users,
    COUNT(api_key) as users_with_keys,
    COUNT(*) - COUNT(api_key) as users_without_keys,
    COUNT(CASE WHEN last_active IS NOT NULL THEN 1 END) as users_who_uploaded,
    COUNT(CASE WHEN last_active IS NULL THEN 1 END) as users_never_uploaded
FROM users;
