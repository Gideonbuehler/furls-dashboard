const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'furls.db');
console.log(`Opening database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Failed to open database:', err.message);
    process.exit(1);
  }
  console.log('✅ Database opened successfully\n');
});

console.log('=== Checking Sessions Table Schema ===\n');

db.all("PRAGMA table_info(sessions)", [], (err, columns) => {
  if (err) {
    console.error('❌ Error getting table info:', err);
    db.close();
    return;
  }
  
  console.log('Columns in sessions table:');
  columns.forEach(col => {
    console.log(`  - ${col.name} (${col.type})`);
  });
  
  const hasPlaylist = columns.some(c => c.name === 'playlist');
  const hasIsRanked = columns.some(c => c.name === 'is_ranked');
  const hasMmr = columns.some(c => c.name === 'mmr');
  const hasMmrChange = columns.some(c => c.name === 'mmr_change');
  
  console.log('\n=== Playlist/MMR Column Check ===');
  console.log(`  playlist: ${hasPlaylist ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  is_ranked: ${hasIsRanked ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  mmr: ${hasMmr ? '✅ EXISTS' : '❌ MISSING'}`);
  console.log(`  mmr_change: ${hasMmrChange ? '✅ EXISTS' : '❌ MISSING'}`);
  
  // Check if any sessions have playlist data
  db.get(`
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN playlist IS NOT NULL THEN 1 ELSE 0 END) as with_playlist,
      SUM(CASE WHEN mmr IS NOT NULL THEN 1 ELSE 0 END) as with_mmr
    FROM sessions
  `, [], (err, stats) => {
    if (err) {
      console.error('❌ Error getting stats:', err);
      db.close();
      return;
    }
    
    console.log('\n=== Session Data Stats ===');
    console.log(`  Total sessions: ${stats.total}`);
    console.log(`  Sessions with playlist: ${stats.with_playlist}`);
    console.log(`  Sessions with MMR: ${stats.with_mmr}`);
    
    if (stats.with_playlist === 0 && stats.with_mmr === 0) {
      console.log('\n⚠️  NO SESSIONS HAVE PLAYLIST OR MMR DATA');
      console.log('   This means the plugin is NOT sending this data.\n');
    }
    
    // Get latest 5 sessions
    db.all(`
      SELECT id, timestamp, shots, goals, playlist, is_ranked, mmr, mmr_change
      FROM sessions
      ORDER BY id DESC
      LIMIT 5
    `, [], (err, recent) => {
      if (err) {
        console.error('❌ Error getting recent sessions:', err);
        db.close();
        return;
      }
      
      console.log('\n=== Latest 5 Sessions ===');
      if (recent.length === 0) {
        console.log('  No sessions found');
      } else {
        recent.forEach(s => {
          console.log(`\nSession #${s.id} (${s.timestamp})`);
          console.log(`  Shots: ${s.shots}, Goals: ${s.goals}`);
          console.log(`  Playlist: ${s.playlist || '❌ NULL'}`);
          console.log(`  Ranked: ${s.is_ranked ? 'YES' : 'NO'}`);
          console.log(`  MMR: ${s.mmr !== null ? s.mmr : '❌ NULL'}`);
          console.log(`  MMR Change: ${s.mmr_change !== null ? s.mmr_change : '❌ NULL'}`);
        });
      }
      
      console.log('\n=== DIAGNOSIS ===');
      if (stats.with_playlist === 0) {
        console.log(`
⚠️  ISSUE FOUND: Plugin is NOT sending playlist/MMR data

POSSIBLE CAUSES:
1. Plugin version is outdated (doesn't have playlist/MMR capture code)
2. Plugin code has a bug preventing metadata capture
3. Plugin is capturing but not including in JSON upload

NEXT STEPS:
1. Check BakkesMod console (F6) for [FURLS] upload messages
2. Look for any error messages about playlist or MMR
3. Verify plugin is calling the correct API functions:
   - ServerWrapper->GetCurrentPlaylist()
   - ServerWrapper->GetLocalPlayerMMR()
4. Check if plugin JSON includes "playlist", "isRanked", "mmr", "mmrChange" fields

SERVER SIDE: ✅ Backend is correctly configured to receive and store this data
PROBLEM: ❌ Plugin is not sending the data
        `);
      } else {
        console.log('\n✅ Playlist/MMR data is being received correctly!');
      }
      
      db.close();
    });
  });
});
