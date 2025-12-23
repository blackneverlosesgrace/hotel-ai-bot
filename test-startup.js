#!/usr/bin/env node
// Quick startup test
import dotenv from 'dotenv';

console.log('🔧 WhatsApp Hotel Bot - Startup Test');
console.log('=====================================\n');

// Load env
dotenv.config();

// Check Node version
console.log(`✓ Node.js version: ${process.version}`);

// Check environment variables
const required = [
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_API_TOKEN',
  'WEBHOOK_VERIFY_TOKEN'
];

console.log('\n📋 Environment Variables:');
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    const masked = value.substring(0, 5) + '...' + value.substring(value.length - 5);
    console.log(`✓ ${key}: ${masked}`);
  } else {
    console.log(`✗ ${key}: MISSING`);
  }
});

// Try importing modules
console.log('\n📦 Module Imports:');
try {
  console.log('Importing express...');
  import('express').then(() => console.log('✓ express'));
  
  console.log('Importing axios...');
  import('axios').then(() => console.log('✓ axios'));
  
  console.log('Importing config...');
  import('./config.js').then(() => console.log('✓ config'));
  
  console.log('Importing server...');
  import('./server.js').then(() => console.log('✓ server'));
} catch (e) {
  console.error('✗ Import Error:', e.message);
}

console.log('\n✅ Startup test complete!');
