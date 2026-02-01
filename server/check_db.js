const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./furls.db');

console.log('Checking database structure...\n');

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  console.log('Tables:', tables.map(t => t.name).join(', '));
  
  // Check users
  db.all("SELECT id, username, email, created_at FROM users LIMIT 5", (err, users) => {
    if (err) console.error('Users error:', err);
    else console.log('\nUsers:', users.length, 'found');
    if (users.length > 0) console.log(users);
    
    // Check sessions
    db.all("SELECT COUNT(*) as count FROM sessions", (err, result) => {
      if (err) console.error('Sessions error:', err);
      else console.log('\nSessions:', result[0].count, 'total');
      
      // Check friendships
      db.all("SELECT COUNT(*) as count FROM friendships", (err, result) => {
        if (err) console.error('Friendships error:', err);
        else console.log('Friendships:', result[0].count, 'total');
        
        db.close();
      });
    });
  });
});
