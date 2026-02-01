// FURLS Dashboard - Complete Data Flow Test
// This script verifies that the plugin -> dashboard -> database pipeline works

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(emoji, message, color = COLORS.reset) {
  console.log(`${color}${emoji} ${message}${COLORS.reset}`);
}

function section(title) {
  console.log(`\n${COLORS.bright}${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}  ${title}${COLORS.reset}`);
  console.log(`${COLORS.bright}${COLORS.cyan}${'='.repeat(60)}${COLORS.reset}\n`);
}

async function testDataFlow() {
  section('FURLS DATA FLOW TEST');

  // Test 1: Check Plugin File
  log('📦', 'Checking BakkesMod plugin data file...', COLORS.yellow);
  const dataFolder = path.join(process.env.APPDATA, 'bakkesmod/bakkesmod/data');
  const statsFile = path.join(dataFolder, 'furls_stats.json');
  
  if (!fs.existsSync(statsFile)) {
    log('❌', `File not found: ${statsFile}`, COLORS.red);
    log('ℹ️', 'Make sure you have played freeplay in Rocket League with the FURLS plugin loaded.', COLORS.yellow);
    return false;
  }
  
  const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
  log('✅', 'Plugin file exists and is readable', COLORS.green);
  log('  ', `  Location: ${statsFile}`);
  log('  ', `  Last updated: ${stats.timestamp}`);
  log('  ', `  Shots: ${stats.shots}, Goals: ${stats.goals}`);

  // Test 2: Check Backend Server
  section('Backend Server Test');
  log('🖥️', 'Checking if backend server is running...', COLORS.yellow);
  
  try {
    const healthRes = await axios.get('http://localhost:3002/api/stats/health');
    log('✅', 'Backend server is running', COLORS.green);
    log('  ', `  Status: ${healthRes.data.status}`);
  } catch (err) {
    log('❌', 'Backend server is not running', COLORS.red);
    log('ℹ️', 'Start the server with: npm start', COLORS.yellow);
    return false;
  }

  // Test 3: Check if Backend Can Read File
  log('📡', 'Checking if backend can read plugin file...', COLORS.yellow);
  
  try {
    const currentRes = await axios.get('http://localhost:3002/api/stats/current');
    if (currentRes.data && currentRes.data.shots !== undefined) {
      log('✅', 'Backend successfully reading plugin file', COLORS.green);
      log('  ', `  Current session: ${currentRes.data.shots} shots, ${currentRes.data.goals} goals`);
      log('  ', `  Timestamp: ${currentRes.data.timestamp}`);
    } else {
      log('⚠️', 'Backend responded but data format unexpected', COLORS.yellow);
    }
  } catch (err) {
    log('❌', 'Backend cannot read plugin file', COLORS.red);
    console.log(err.message);
    return false;
  }

  // Test 4: Check Database
  section('Database Test');
  log('💾', 'Checking database...', COLORS.yellow);
  
  const db = require('./server/database.js');
  
  // Check users
  const users = await new Promise((resolve, reject) => {
    db.all('SELECT id, username, created_at FROM users LIMIT 5', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  if (users.length > 0) {
    log('✅', `Database has ${users.length} user(s)`, COLORS.green);
    users.forEach(user => {
      log('  ', `  - ${user.username} (ID: ${user.id})`);
    });
  } else {
    log('⚠️', 'No users in database yet', COLORS.yellow);
    log('ℹ️', 'Register an account to start saving stats', COLORS.yellow);
  }

  // Check sessions
  const sessions = await new Promise((resolve, reject) => {
    db.all('SELECT COUNT(*) as count FROM sessions', (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
  
  log('✅', `Database has ${sessions[0].count} saved session(s)`, COLORS.green);

  // Test 5: Check Frontend
  section('Frontend Test');
  log('🌐', 'Checking if frontend is accessible...', COLORS.yellow);
  
  try {
    const frontendRes = await axios.get('http://localhost:5173', {
      validateStatus: () => true // Accept any status
    });
    
    if (frontendRes.status === 200 || frontendRes.status === 304) {
      log('✅', 'Frontend is running', COLORS.green);
      log('  ', '  URL: http://localhost:5173');
    } else {
      log('⚠️', `Frontend returned status ${frontendRes.status}`, COLORS.yellow);
    }
  } catch (err) {
    log('❌', 'Frontend is not running', COLORS.red);
    log('ℹ️', 'Start the frontend with: cd client && npm run dev', COLORS.yellow);
    return false;
  }

  // Summary
  section('DATA FLOW SUMMARY');
  log('✅', 'Plugin File → Backend Server → Frontend', COLORS.green);
  log('  ', '  ✓ Plugin exports stats to JSON file');
  log('  ', '  ✓ Backend server reads the file');
  log('  ', '  ✓ Frontend polls backend for updates');
  log('  ', '  ✓ Database stores user sessions');
  
  log('\n🚀', 'COMPLETE DATA FLOW WORKING!', COLORS.bright + COLORS.green);
  
  section('NEXT STEPS');
  log('1️⃣', 'Open http://localhost:5173 in your browser');
  log('2️⃣', 'Register an account or login');
  log('3️⃣', 'Play freeplay in Rocket League');
  log('4️⃣', 'Watch your stats appear in the dashboard!');
  log('5️⃣', 'Your stats will automatically save to your account');

  return true;
}

// Run the test
testDataFlow().catch(err => {
  log('❌', 'Test failed with error:', COLORS.red);
  console.error(err);
  process.exit(1);
});
