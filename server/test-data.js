// Test data generator for FURLS Dashboard
// Run this to create sample data: node server/test-data.js

const fs = require("fs");
const path = require("path");

const DATA_FOLDER = path.join(
  process.env.APPDATA || "",
  "bakkesmod/bakkesmod/data"
);
const STATS_FILE = path.join(DATA_FOLDER, "furls_stats.json");

// Generate random heatmap data
function generateHeatmap(width, height, intensity = 0.3) {
  const heatmap = [];
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      // More shots in the middle of the field
      const centerBonus =
        Math.max(0, 1 - Math.abs(x - width / 2) / (width / 2)) *
        Math.max(0, 1 - Math.abs(y - height / 2) / (height / 2));
      const value =
        Math.random() < intensity * (0.5 + centerBonus)
          ? Math.floor(Math.random() * 10) + 1
          : 0;
      row.push(value);
    }
    heatmap.push(row);
  }
  return heatmap;
}

// Generate test session data
function generateTestSession() {
  const shots = Math.floor(Math.random() * 50) + 30;
  const goals = Math.floor(shots * (Math.random() * 0.6 + 0.2)); // 20-80% accuracy

  const testData = {
    timestamp: new Date().toISOString(),
    shots: shots,
    goals: goals,
    averageSpeed: Math.random() * 500 + 1200,
    speedSamples: Math.floor(Math.random() * 500) + 800,
    boostCollected: Math.random() * 200 + 300,
    boostUsed: Math.random() * 150 + 250,
    gameTime: Math.random() * 200 + 200,
    possessionTime: Math.random() * 100 + 80,
    teamPossessionTime: Math.random() * 120 + 100,
    opponentPossessionTime: Math.random() * 80 + 60,
    shotHeatmap: generateHeatmap(50, 62, 0.3),
    goalHeatmap: generateHeatmap(50, 62, 0.15),
  };

  return testData;
}

// Ensure directory exists
if (!fs.existsSync(DATA_FOLDER)) {
  fs.mkdirSync(DATA_FOLDER, { recursive: true });
  console.log("Created data folder:", DATA_FOLDER);
}

// Generate and save test data
const testData = generateTestSession();
fs.writeFileSync(STATS_FILE, JSON.stringify(testData, null, 2));

console.log("✅ Test data generated successfully!");
console.log("📁 File:", STATS_FILE);
console.log("📊 Stats:");
console.log(`   - Shots: ${testData.shots}`);
console.log(`   - Goals: ${testData.goals}`);
console.log(
  `   - Accuracy: ${((testData.goals / testData.shots) * 100).toFixed(1)}%`
);
console.log(`   - Avg Speed: ${testData.averageSpeed.toFixed(1)}`);
console.log("");
console.log("🚀 Now start the dashboard with: npm run dev");
console.log("🌐 Then open: http://localhost:5173");
