#!/usr/bin/env node
// Test API token by fetching phone number info

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TOKEN = process.env.WHATSAPP_API_TOKEN;
const API_VERSION = 'v18.0';

console.log('\n🔍 Testing API Token by Fetching Phone Number Info\n');

// Try to get phone number details - this validates the token
axios.get(
  `https://graph.facebook.com/${API_VERSION}/${PHONE_ID}`,
  {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    timeout: 10000
  }
)
.then(response => {
  console.log('✅ Token is VALID!\n');
  console.log('Phone Number Info:');
  console.log(JSON.stringify(response.data, null, 2));
})
.catch(error => {
  console.error('❌ Token test failed:\n');
  console.error(`Status: ${error.response?.status}`);
  console.error(`Error: ${error.response?.data?.error?.message}`);
  
  if (error.response?.data?.error?.code === 190) {
    console.error('\n⚠️  Error 190: Invalid OAuth access token');
    console.error('Possible causes:');
    console.error('1. Token is for a different Business Account');
    console.error('2. Token is for a different App');
    console.error('3. Token was generated but never activated');
    console.error('4. Token needs permissions granted');
  }
  
  console.error('\nDebug Info:');
  console.error('Phone ID:', PHONE_ID);
  console.error('Token length:', TOKEN?.length);
  console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
});
