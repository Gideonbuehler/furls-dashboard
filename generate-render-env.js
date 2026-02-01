#!/usr/bin/env node

/**
 * Render Environment Setup Helper
 * Generates secure keys for Render deployment
 */

const crypto = require('crypto');

console.log('='.repeat(60));
console.log('  FURLS Dashboard - Render Environment Variables');
console.log('='.repeat(60));
console.log('');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ Generated JWT_SECRET:');
console.log(`JWT_SECRET=${jwtSecret}`);
console.log('');

// Generate API Key Salt (optional, for extra security)
const apiSalt = crypto.randomBytes(32).toString('hex');
console.log('✅ Generated API_KEY_SALT (optional):');
console.log(`API_KEY_SALT=${apiSalt}`);
console.log('');

console.log('📋 Copy these to Render Dashboard → Environment:');
console.log('-'.repeat(60));
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`NODE_ENV=production`);
console.log(`PORT=10000`);
console.log(`DATABASE_URL=file:./furls.db`);
console.log('-'.repeat(60));
console.log('');

console.log('⚠️  IMPORTANT:');
console.log('1. Go to https://dashboard.render.com');
console.log('2. Select your service');
console.log('3. Go to Environment tab');
console.log('4. Add each variable above');
console.log('5. Click "Save Changes"');
console.log('6. Render will automatically redeploy');
console.log('');

console.log('✅ After deployment, test:');
console.log('curl https://your-app.onrender.com/api/health');
console.log('');
