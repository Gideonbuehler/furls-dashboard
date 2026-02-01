/**
 * System Test Script
 * Tests the complete authentication and stats flow
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3002/api';
let authToken = null;
let userId = null;

// Test user credentials
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
};

console.log('🧪 FURLS Dashboard System Test\n');
console.log('=' .repeat(50));

async function test() {
  try {
    // Test 1: Register new user
    console.log('\n1️⃣  Testing user registration...');
    const registerRes = await axios.post(`${API_BASE}/auth/register`, testUser);
    authToken = registerRes.data.token;
    userId = registerRes.data.user.id;
    console.log('✅ Registration successful!');
    console.log(`   User ID: ${userId}`);
    console.log(`   Username: ${registerRes.data.user.username}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // Test 2: Get user profile
    console.log('\n2️⃣  Testing get profile...');
    const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Profile retrieved!');
    console.log(`   Username: ${profileRes.data.username}`);
    console.log(`   Email: ${profileRes.data.email}`);

    // Test 3: Save a session
    console.log('\n3️⃣  Testing save session...');
    const sessionData = {
      timestamp: new Date().toISOString(),
      shots: 15,
      goals: 5,
      averageSpeed: 1250,
      speedSamples: 1000,
      boostCollected: 800,
      boostUsed: 750,
      gameTime: 300,
      possessionTime: 150,
      teamPossessionTime: 200,
      opponentPossessionTime: 100,
      shotHeatmap: [[50, 50, 10], [60, 40, 8]],
      goalHeatmap: [[55, 45, 5]]
    };
    const saveRes = await axios.post(`${API_BASE}/stats/save`, sessionData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Session saved!');
    console.log(`   Session ID: ${saveRes.data.sessionId}`);

    // Test 4: Get session history
    console.log('\n4️⃣  Testing get session history...');
    const historyRes = await axios.get(`${API_BASE}/stats/history?limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ History retrieved!');
    console.log(`   Total sessions: ${historyRes.data.length}`);
    if (historyRes.data.length > 0) {
      const latest = historyRes.data[0];
      console.log(`   Latest session: ${latest.shots} shots, ${latest.goals} goals`);
    }

    // Test 5: Get all-time stats
    console.log('\n5️⃣  Testing get all-time stats...');
    const allTimeRes = await axios.get(`${API_BASE}/stats/alltime`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ All-time stats retrieved!');
    console.log(`   Total sessions: ${allTimeRes.data.total_sessions}`);
    console.log(`   Total shots: ${allTimeRes.data.total_shots}`);
    console.log(`   Total goals: ${allTimeRes.data.total_goals}`);
    console.log(`   Avg accuracy: ${allTimeRes.data.avg_accuracy?.toFixed(2)}%`);

    // Test 6: Search for users
    console.log('\n6️⃣  Testing user search...');
    const searchRes = await axios.get(`${API_BASE}/friends/search?query=test`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ User search working!');
    console.log(`   Found ${searchRes.data.length} users`);

    // Test 7: Get friends leaderboard
    console.log('\n7️⃣  Testing leaderboard...');
    const leaderboardRes = await axios.get(`${API_BASE}/stats/leaderboard?type=global&sort=total_goals&limit=10`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Leaderboard retrieved!');
    console.log(`   Top players: ${leaderboardRes.data.length}`);
    if (leaderboardRes.data.length > 0) {
      console.log(`   #1: ${leaderboardRes.data[0].username} (${leaderboardRes.data[0].total_goals} goals)`);
    }

    // Test 8: Login with same credentials
    console.log('\n8️⃣  Testing login...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Login successful!');
    console.log(`   Token: ${loginRes.data.token.substring(0, 20)}...`);

    console.log('\n' + '='.repeat(50));
    console.log('✅ ALL TESTS PASSED! System is working correctly.');
    console.log('\n📊 Test Summary:');
    console.log('   - User registration: ✅');
    console.log('   - User authentication: ✅');
    console.log('   - Session saving: ✅');
    console.log('   - Session history: ✅');
    console.log('   - All-time stats: ✅');
    console.log('   - User search: ✅');
    console.log('   - Leaderboard: ✅');
    console.log('   - Login: ✅');
    console.log('\n🎉 The FURLS Dashboard is ready to use!');
    console.log('\n💡 Next steps:');
    console.log('   1. Open http://localhost:5173 in your browser');
    console.log('   2. Register a new account');
    console.log('   3. Play some games with the BakkesMod plugin');
    console.log('   4. Watch your stats automatically save to your account');
    console.log('   5. Add friends and compete on the leaderboard!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED!');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    console.error('\n💡 Make sure both servers are running:');
    console.error('   - Backend: npm start (in /Dashboard/server)');
    console.error('   - Frontend: npm run dev (in /Dashboard/client)\n');
  }
}

test();
