#!/usr/bin/env node
// Comprehensive Bot Pipeline Diagnostic
import dotenv from 'dotenv';
import axios from 'axios';

console.log('\n🔍 WhatsApp Hotel Bot - Pipeline Diagnostics');
console.log('='.repeat(60));

// Step 1: Load Environment Variables
console.log('\n[1/6] Loading Environment Variables...');
dotenv.config();

const required = [
  'WHATSAPP_PHONE_NUMBER_ID',
  'WHATSAPP_API_TOKEN',
  'WEBHOOK_VERIFY_TOKEN'
];

let allEnvSet = true;
required.forEach(key => {
  const value = process.env[key];
  if (value) {
    console.log(`  ✓ ${key}: ${value.substring(0, 10)}...${value.substring(value.length - 5)}`);
  } else {
    console.log(`  ✗ ${key}: MISSING`);
    allEnvSet = false;
  }
});

if (!allEnvSet) {
  console.error('\n❌ Missing environment variables! Check .env file');
  process.exit(1);
}

// Step 2: Check Render Deployment
console.log('\n[2/6] Checking Render Deployment...');
try {
  const response = await axios.get('https://hotel-ai-bot.onrender.com/status', {
    timeout: 5000
  });
  
  if (response.status === 200) {
    console.log('  ✓ Render deployment is LIVE');
    const data = response.data;
    console.log(`  ✓ Status: ${data.status}`);
    console.log(`  ✓ WhatsApp Service: ${data.service.whatsapp}`);
    console.log(`  ✓ Reminders: ${data.service.reminders}`);
  }
} catch (error) {
  console.log(`  ✗ Render unreachable: ${error.message}`);
}

// Step 3: Check Webhook Verification
console.log('\n[3/6] Testing Webhook Verification...');
try {
  const token = process.env.WEBHOOK_VERIFY_TOKEN;
  const response = await axios.get(
    `https://hotel-ai-bot.onrender.com/webhook?hub.mode=subscribe&hub.challenge=TEST123&hub.verify_token=${token}`,
    { timeout: 5000 }
  );
  
  if (response.status === 200 && response.data === 'TEST123') {
    console.log('  ✓ Webhook verification WORKS');
  } else {
    console.log(`  ✗ Webhook returned: ${response.status} - ${response.data}`);
  }
} catch (error) {
  console.log(`  ✗ Webhook verification failed: ${error.message}`);
}

// Step 4: Check API Token Validity
console.log('\n[4/6] Testing WhatsApp API Token...');
try {
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_API_TOKEN;
  
  const response = await axios.get(
    `https://graph.facebook.com/v18.0/${phoneId}`,
    {
      params: { access_token: token },
      timeout: 5000
    }
  );
  
  if (response.status === 200) {
    console.log('  ✓ WhatsApp API Token is VALID');
    console.log(`  ✓ Phone Number ID: ${response.data.id}`);
  }
} catch (error) {
  if (error.response?.status === 400) {
    console.log('  ✗ Invalid or expired API token');
  } else {
    console.log(`  ✗ Token test failed: ${error.message}`);
  }
}

// Step 5: Check Users Endpoint
console.log('\n[5/6] Checking User Database...');
try {
  const response = await axios.get('https://hotel-ai-bot.onrender.com/users', {
    timeout: 5000
  });
  
  const users = response.data;
  console.log(`  ✓ User database reachable`);
  console.log(`  ✓ Total users: ${users.total || 0}`);
  
  if (users.total === 0) {
    console.log('  ⚠ No users yet - bot hasn\'t received any messages');
  }
} catch (error) {
  console.log(`  ✗ User database check failed: ${error.message}`);
}

// Step 6: Summary & Recommendations
console.log('\n[6/6] Pipeline Analysis...');
console.log('\n📋 Checklist:');
console.log('  □ Bot is LIVE on Render');
console.log('  □ Webhook verification working');
console.log('  □ API token is valid');
console.log('  □ No users received yet (bot not getting messages)');

console.log('\n❌ LIKELY ISSUES:');
console.log('  1. Webhook "messages" event NOT subscribed in Meta Dashboard');
console.log('  2. Phone number not added to "Recipient Phone Numbers"');
console.log('  3. Messages sent to wrong phone number');
console.log('  4. Meta webhook not sending events to your endpoint');

console.log('\n✅ FIX STEPS:');
console.log('  1. Go to Meta Dashboard → WhatsApp → Configuration');
console.log('  2. Webhook fields → CHECK "messages" → SAVE');
console.log('  3. Add your test phone number to "Recipient Phone Numbers"');
console.log('  4. Verify phone number');
console.log('  5. Send a test message from your phone');

console.log('\n' + '='.repeat(60));
console.log('For detailed logs, check Render dashboard → Logs tab\n');
