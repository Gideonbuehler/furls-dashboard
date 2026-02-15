// Reset all match/session data on the Render PostgreSQL database
// Keeps users, friendships, and settings intact
// Usage: DATABASE_URL="your_render_postgres_url" node reset_match_data.js

const { Pool } = require("pg");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL environment variable is required.");
  console.error("");
  console.error("Usage:");
  console.error('  $env:DATABASE_URL="postgresql://..."; node reset_match_data.js');
  console.error("");
  console.error("You can find your DATABASE_URL in the Render.com dashboard:");
  console.error("  → furls-db → Info → External Database URL");
  process.exit(1);
}

async function resetMatchData() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  const client = await pool.connect();

  try {
    console.log("🔌 Connected to Render PostgreSQL database.\n");

    // Show current state before reset
    const sessionCount = await client.query("SELECT COUNT(*) as count FROM sessions");
    const userCount = await client.query("SELECT COUNT(*) as count FROM users");
    const userStats = await client.query(
      "SELECT id, username, total_sessions, total_shots, total_goals FROM users ORDER BY id"
    );

    console.log(`📊 Current state:`);
    console.log(`   Users: ${userCount.rows[0].count}`);
    console.log(`   Sessions: ${sessionCount.rows[0].count}`);
    console.log("");
    console.log("   User totals before reset:");
    userStats.rows.forEach((u) => {
      console.log(
        `     ${u.username} — ${u.total_sessions} sessions, ${u.total_shots} shots, ${u.total_goals} goals`
      );
    });
    console.log("");

    // Perform the reset
    console.log("🗑️  Deleting all sessions...");
    const deleted = await client.query("DELETE FROM sessions");
    console.log(`   Deleted ${deleted.rowCount} sessions.`);

    console.log("🔄 Resetting user aggregate stats...");
    await client.query(
      "UPDATE users SET total_sessions = 0, total_shots = 0, total_goals = 0"
    );

    // Reset the sessions ID sequence so new sessions start from 1
    console.log("🔄 Resetting session ID sequence...");
    await client.query("ALTER SEQUENCE sessions_id_seq RESTART WITH 1");

    // Verify
    const afterCount = await client.query("SELECT COUNT(*) as count FROM sessions");
    const afterUsers = await client.query(
      "SELECT id, username, total_sessions, total_shots, total_goals FROM users ORDER BY id"
    );

    console.log("");
    console.log("✅ Reset complete!");
    console.log(`   Sessions remaining: ${afterCount.rows[0].count}`);
    console.log("   User totals after reset:");
    afterUsers.rows.forEach((u) => {
      console.log(
        `     ${u.username} — ${u.total_sessions} sessions, ${u.total_shots} shots, ${u.total_goals} goals`
      );
    });
  } catch (err) {
    console.error("❌ Error resetting match data:", err);
  } finally {
    client.release();
    await pool.end();
    console.log("\n🔌 Disconnected from database.");
  }
}

resetMatchData();
