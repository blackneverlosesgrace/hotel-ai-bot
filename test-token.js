#!/usr/bin/env node
// Test if API token is valid by trying to send a test message

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_API_TOKEN;
const RECIPIENT = '919140818806'; // Your phone number (correct format: country code + 10 digit number)
const API_VERSION = 'v18.0';

console.log('\n🔐 Testing WhatsApp API Token...\n');
console.log(`Phone ID: ${PHONE_ID}`);
console.log(`Token: ${TOKEN ? TOKEN.substring(0, 20) + '...' : 'MISSING'}`);
console.log(`Recipient: ${RECIPIENT}\n`);

if (!PHONE_ID || !TOKEN) {
  console.error('✗ Missing credentials in .env file');
  process.exit(1);
}

const testMessage = {
  messaging_product: 'whatsapp',
  recipient_type: 'individual',
  to: RECIPIENT,
  type: 'text',
  text: {
    body: '🧪 API Token Test - नमस्ते! यह एक परीक्षण संदेश है।'
  }
};

console.log('📤 Sending test message to API...\n');

axios.post(
  `https://graph.facebook.com/${API_VERSION}/${PHONE_ID}/messages`,
  testMessage,
  {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  }
)
.then(response => {
  console.log('✅ SUCCESS! API Token is valid!\n');
  console.log('Response:');
  console.log(JSON.stringify(response.data, null, 2));
  console.log('\n📱 Check your WhatsApp - you should receive a test message!');
})
.catch(error => {
  console.error('❌ FAILED! API Error:\n');
  console.error(`Status: ${error.response?.status}`);
  console.error(`Message: ${error.response?.statusText}`);
  console.error('\nError Details:');
  console.error(JSON.stringify(error.response?.data, null, 2));
  
  if (error.response?.data?.error?.code === 190) {
    console.error('\n⚠️  Token Error (190): Your API token is invalid or expired.');
    console.error('   → Generate a new token from https://developers.facebook.com/');
  } else if (error.response?.data?.error?.code === 100) {
    console.error('\n⚠️  Invalid Recipient (100): Phone number is not correct or not verified.');
  }
});
