# 🔧 FINAL FIX - PostgreSQL ROUND() Function

## 🐛 The Issue

PostgreSQL's `ROUND()` function requires NUMERIC type, not FLOAT/DOUBLE PRECISION.

### Error:

```
function round(double precision, integer) does not exist
```

### Root Cause:

```sql
-- ❌ WRONG (works in SQLite, fails in PostgreSQL)
ROUND((CAST(value AS FLOAT) / divisor * 100), 2)

-- ✅ CORRECT (works in PostgreSQL)
ROUND((value::numeric / divisor * 100)::numeric, 2)
```

---

## ✅ The Fix

### File: `server/routes/public.js`

#### Changed Accuracy Calculation:

```sql
-- OLD (broken):
ROUND(COALESCE((CAST(COALESCE(total_goals, 0) AS FLOAT) / NULLIF(COALESCE(total_shots, 0), 0) * 100), 0), 2) as accuracy

-- NEW (working):
ROUND(COALESCE((COALESCE(total_goals, 0)::numeric / NULLIF(COALESCE(total_shots, 0), 0) * 100), 0)::numeric, 2) as accuracy
```

#### Changed ORDER BY for Accuracy:

```sql
-- OLD (broken):
orderBy = "(CAST(COALESCE(total_goals, 0) AS FLOAT) / NULLIF(COALESCE(total_shots, 0), 0)) DESC NULLS LAST"

-- NEW (working):
orderBy = "(COALESCE(total_goals, 0)::numeric / NULLIF(COALESCE(total_shots, 0), 0)) DESC NULLS LAST"
```

---

## 🚀 Deploy Command

```powershell
cd "c:\Users\gideo\source\repos\FURLS\Dashboard"
git add server/routes/public.js
git commit -m "Fix PostgreSQL ROUND() function - use ::numeric cast instead of CAST AS FLOAT"
git push origin main
```

---

## 🧪 Expected Result

After deployment, these endpoints will work:

✅ `GET /api/public/leaderboard/accuracy`  
✅ `GET /api/public/leaderboard/goals`  
✅ `GET /api/public/leaderboard/shots`  
✅ `GET /api/public/leaderboard/sessions`

---

## 📊 What Was Fixed

1. ✅ Leaderboard accuracy calculation (ROUND with numeric)
2. ✅ Leaderboard accuracy sorting (ORDER BY with numeric)
3. ✅ All COALESCE fallbacks in place
4. ✅ NULLS LAST to handle edge cases

---

## 🎯 Test After Deploy

```powershell
# Quick test
Invoke-RestMethod -Uri "https://furls.net/api/public/leaderboard/accuracy"
```

Should return JSON array of players with stats (no 500 error).

---

**Status:** ✅ READY TO DEPLOY  
**ETA:** 2-3 minutes  
**Risk:** 🟢 MINIMAL - Only SQL syntax fix
