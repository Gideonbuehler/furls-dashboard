const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "server", "furls.db");
console.log(`Opening database: ${dbPath}\n`);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to open database:", err.message);
    process.exit(1);
  }
  console.log("✅ Database opened successfully\n");
});

console.log("=== Running Playlist/MMR Column Migrations ===\n");

// Check current table structure
db.all("PRAGMA table_info(sessions)", [], (err, columns) => {
  if (err) {
    console.error("❌ Error checking sessions table:", err);
    db.close();
    return;
  }

  const columnNames = columns.map((col) => col.name);
  console.log(`Current columns: ${columnNames.join(", ")}\n`);

  let migrationsRun = 0;
  let migrationsNeeded = 0;

  // Check and add playlist column
  if (!columnNames.includes("playlist")) {
    migrationsNeeded++;
    db.run("ALTER TABLE sessions ADD COLUMN playlist TEXT", (err) => {
      if (err) {
        console.error("❌ Error adding playlist column:", err);
      } else {
        console.log("✅ Added playlist column to sessions table");
        migrationsRun++;
      }
      checkComplete();
    });
  } else {
    console.log("✓ playlist column already exists");
  }

  // Check and add is_ranked column
  if (!columnNames.includes("is_ranked")) {
    migrationsNeeded++;
    db.run(
      "ALTER TABLE sessions ADD COLUMN is_ranked INTEGER DEFAULT 0",
      (err) => {
        if (err) {
          console.error("❌ Error adding is_ranked column:", err);
        } else {
          console.log("✅ Added is_ranked column to sessions table");
          migrationsRun++;
        }
        checkComplete();
      }
    );
  } else {
    console.log("✓ is_ranked column already exists");
  }

  // Check and add mmr column
  if (!columnNames.includes("mmr")) {
    migrationsNeeded++;
    db.run("ALTER TABLE sessions ADD COLUMN mmr REAL", (err) => {
      if (err) {
        console.error("❌ Error adding mmr column:", err);
      } else {
        console.log("✅ Added mmr column to sessions table");
        migrationsRun++;
      }
      checkComplete();
    });
  } else {
    console.log("✓ mmr column already exists");
  }

  // Check and add mmr_change column
  if (!columnNames.includes("mmr_change")) {
    migrationsNeeded++;
    db.run("ALTER TABLE sessions ADD COLUMN mmr_change REAL", (err) => {
      if (err) {
        console.error("❌ Error adding mmr_change column:", err);
      } else {
        console.log("✅ Added mmr_change column to sessions table");
        migrationsRun++;
      }
      checkComplete();
    });
  } else {
    console.log("✓ mmr_change column already exists");
  }

  function checkComplete() {
    if (migrationsRun === migrationsNeeded) {
      console.log(
        `\n✅ All migrations complete (${migrationsRun} columns added)`
      );

      // Verify the changes
      db.all("PRAGMA table_info(sessions)", [], (err, updatedColumns) => {
        if (err) {
          console.error("❌ Error verifying changes:", err);
          db.close();
          return;
        }

        console.log("\n=== Verification ===");
        const hasPlaylist = updatedColumns.some((c) => c.name === "playlist");
        const hasIsRanked = updatedColumns.some((c) => c.name === "is_ranked");
        const hasMmr = updatedColumns.some((c) => c.name === "mmr");
        const hasMmrChange = updatedColumns.some(
          (c) => c.name === "mmr_change"
        );

        console.log(`  playlist: ${hasPlaylist ? "✅ EXISTS" : "❌ MISSING"}`);
        console.log(`  is_ranked: ${hasIsRanked ? "✅ EXISTS" : "❌ MISSING"}`);
        console.log(`  mmr: ${hasMmr ? "✅ EXISTS" : "❌ MISSING"}`);
        console.log(
          `  mmr_change: ${hasMmrChange ? "✅ EXISTS" : "❌ MISSING"}`
        );

        if (hasPlaylist && hasIsRanked && hasMmr && hasMmrChange) {
          console.log(
            "\n🎉 SUCCESS! Database is ready to receive playlist/MMR data"
          );
        } else {
          console.log("\n⚠️  WARNING: Some columns may be missing");
        }

        db.close();
      });
    }
  }

  // If no migrations needed, close immediately
  if (migrationsNeeded === 0) {
    console.log("\n✅ All columns already exist - no migrations needed");
    db.close();
  }
});
