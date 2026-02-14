// Check if playlist/MMR columns exist in production database
const { Pool } = require("pg");
const sqlite3 = require("sqlite3");
const { promisify } = require("util");

async function checkDatabase() {
  const isProduction = process.env.DATABASE_URL ? true : false;

  console.log(
    `\n🔍 Checking ${
      isProduction ? "PRODUCTION (PostgreSQL)" : "LOCAL (SQLite)"
    } database...\n`
  );

  if (isProduction) {
    // PostgreSQL (Render.com)
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    try {
      // Check if columns exist
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'sessions'
        AND column_name IN ('playlist', 'is_ranked', 'mmr', 'mmr_change')
        ORDER BY column_name
      `);

      console.log("📊 Playlist/MMR Columns in sessions table:");
      console.log("═".repeat(60));

      if (result.rows.length === 0) {
        console.log("❌ NO PLAYLIST/MMR COLUMNS FOUND!");
        console.log("\n⚠️  MIGRATIONS HAVE NOT RUN YET ON PRODUCTION!\n");
        console.log(
          "Solution: Redeploy the app on Render.com to trigger migrations.\n"
        );
      } else {
        result.rows.forEach((col) => {
          console.log(
            `✅ ${col.column_name.padEnd(15)} | Type: ${col.data_type.padEnd(
              20
            )} | Nullable: ${col.is_nullable}`
          );
        });
      }

      // Check if any sessions have playlist data
      const dataCheck = await pool.query(`
        SELECT COUNT(*) as total,
               COUNT(playlist) as with_playlist,
               COUNT(mmr) as with_mmr
        FROM sessions
      `);

      console.log("\n📈 Session Data Status:");
      console.log("═".repeat(60));
      console.log(`Total Sessions:          ${dataCheck.rows[0].total}`);
      console.log(
        `Sessions with Playlist:  ${dataCheck.rows[0].with_playlist}`
      );
      console.log(`Sessions with MMR:       ${dataCheck.rows[0].with_mmr}`);

      if (
        dataCheck.rows[0].total > 0 &&
        dataCheck.rows[0].with_playlist === "0"
      ) {
        console.log("\n⚠️  You have sessions but NO playlist/MMR data!");
        console.log(
          "This means the plugin is NOT sending playlist/MMR fields.\n"
        );
      }

      // Show recent sessions
      const recentSessions = await pool.query(`
        SELECT id, timestamp, shots, goals, playlist, is_ranked, mmr, mmr_change
        FROM sessions
        ORDER BY timestamp DESC
        LIMIT 5
      `);

      console.log("\n📋 Most Recent Sessions:");
      console.log("═".repeat(60));
      recentSessions.rows.forEach((session) => {
        console.log(
          `Session #${session.id} (${new Date(
            session.timestamp
          ).toLocaleString()})`
        );
        console.log(`  Shots: ${session.shots}, Goals: ${session.goals}`);
        console.log(`  Playlist: ${session.playlist || "NULL"}`);
        console.log(`  Ranked: ${session.is_ranked ? "Yes" : "No"}`);
        console.log(
          `  MMR: ${session.mmr || "NULL"}, Change: ${
            session.mmr_change || "NULL"
          }`
        );
        console.log("");
      });

      await pool.end();
    } catch (err) {
      console.error("❌ Error checking PostgreSQL database:", err.message);
      await pool.end();
    }
  } else {
    // SQLite (Local)
    const db = new sqlite3.Database("./server/furls.db");
    const dbGet = promisify(db.get.bind(db));
    const dbAll = promisify(db.all.bind(db));

    try {
      // Check table schema
      const columns = await dbAll("PRAGMA table_info(sessions)");

      console.log("📊 Playlist/MMR Columns in sessions table:");
      console.log("═".repeat(60));

      const playlistCols = columns.filter((col) =>
        ["playlist", "is_ranked", "mmr", "mmr_change"].includes(col.name)
      );

      if (playlistCols.length === 0) {
        console.log("❌ NO PLAYLIST/MMR COLUMNS FOUND!");
        console.log("\n⚠️  MIGRATIONS HAVE NOT RUN YET!\n");
      } else {
        playlistCols.forEach((col) => {
          console.log(
            `✅ ${col.name.padEnd(15)} | Type: ${col.type.padEnd(
              10
            )} | Nullable: ${col.notnull ? "NO" : "YES"}`
          );
        });
      }

      // Check data
      const dataCheck = await dbGet(`
        SELECT COUNT(*) as total,
               SUM(CASE WHEN playlist IS NOT NULL THEN 1 ELSE 0 END) as with_playlist,
               SUM(CASE WHEN mmr IS NOT NULL THEN 1 ELSE 0 END) as with_mmr
        FROM sessions
      `);

      console.log("\n📈 Session Data Status:");
      console.log("═".repeat(60));
      console.log(`Total Sessions:          ${dataCheck.total}`);
      console.log(`Sessions with Playlist:  ${dataCheck.with_playlist}`);
      console.log(`Sessions with MMR:       ${dataCheck.with_mmr}`);

      // Show recent sessions
      const recentSessions = await dbAll(`
        SELECT id, timestamp, shots, goals, playlist, is_ranked, mmr, mmr_change
        FROM sessions
        ORDER BY timestamp DESC
        LIMIT 5
      `);

      console.log("\n📋 Most Recent Sessions:");
      console.log("═".repeat(60));
      recentSessions.forEach((session) => {
        console.log(
          `Session #${session.id} (${new Date(
            session.timestamp
          ).toLocaleString()})`
        );
        console.log(`  Shots: ${session.shots}, Goals: ${session.goals}`);
        console.log(`  Playlist: ${session.playlist || "NULL"}`);
        console.log(`  Ranked: ${session.is_ranked ? "Yes" : "No"}`);
        console.log(
          `  MMR: ${session.mmr || "NULL"}, Change: ${
            session.mmr_change || "NULL"
          }`
        );
        console.log("");
      });

      db.close();
    } catch (err) {
      console.error("❌ Error checking SQLite database:", err.message);
      db.close();
    }
  }
}

checkDatabase();
