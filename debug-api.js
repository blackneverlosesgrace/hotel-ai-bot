#!/usr/bin/env node
// Debug what's wrong with the API access

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.WHATSAPP_API_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

console.log('\n🔧 Debug API Access\n');
console.log('Configuration:');
console.log(`  Token: ${TOKEN?.substring(0, 20)}...${TOKEN?.substring(TOKEN.length - 10)}`);
console.log(`  Phone ID: ${PHONE_ID}`);
console.log(`  Business ID: ${BUSINESS_ID}\n`);

// Test 1: Try with Business Account ID
console.log('Test 1: Querying Business Account...');
axios.get(
  `https://graph.facebook.com/v18.0/${BUSINESS_ID}`,
  {
    params: { access_token: TOKEN },
    timeout: 5000
  }
)
.then(res => {
  console.log('✅ Business Account accessible');
  console.log('Data:', JSON.stringify(res.data, null, 2));
})
.catch(err => {
  console.log('❌ Business Account query failed');
  console.log('Error:', err.response?.data?.error?.message);
});

// Test 2: Try with Phone ID
setTimeout(() => {
  console.log('\nTest 2: Querying Phone ID...');
  axios.get(
    `https://graph.facebook.com/v18.0/${PHONE_ID}`,
    {
      params: { access_token: TOKEN },
      timeout: 5000
    }
  )
  .then(res => {
    console.log('✅ Phone ID accessible');
    console.log('Data:', JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.log('❌ Phone ID query failed');
    console.log('Error:', err.response?.data?.error?.message);
  });
}, 1000);

// Test 3: Try getting phone numbers from business account
setTimeout(() => {
  console.log('\nTest 3: Getting Phone Numbers...');
  axios.get(
    `https://graph.facebook.com/v18.0/${BUSINESS_ID}/phone_numbers`,
    {
      params: { access_token: TOKEN },
      timeout: 5000
    }
  )
  .then(res => {
    console.log('✅ Phone numbers found');
    console.log('Data:', JSON.stringify(res.data, null, 2));
  })
  .catch(err => {
    console.log('❌ Phone numbers query failed');
    console.log('Error:', err.response?.data?.error?.message);
  });
}, 2000);
