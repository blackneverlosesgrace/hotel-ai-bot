#!/usr/bin/env node
// Find the correct Phone Number ID

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.WHATSAPP_API_TOKEN;
const BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

if (!TOKEN || !BUSINESS_ACCOUNT_ID) {
  console.error('❌ Missing TOKEN or BUSINESS_ACCOUNT_ID in .env');
  process.exit(1);
}

console.log('\n📱 Fetching Phone Numbers from Business Account...\n');

axios.get(
  `https://graph.facebook.com/v18.0/${BUSINESS_ACCOUNT_ID}/phone_numbers`,
  {
    params: {
      access_token: TOKEN
    },
    timeout: 10000
  }
)
.then(response => {
  console.log('✅ Success! Found phone numbers:\n');
  if (response.data.data && response.data.data.length > 0) {
    response.data.data.forEach((phone, index) => {
      console.log(`Phone Number ${index + 1}:`);
      console.log(`  ID: ${phone.id}`);
      console.log(`  Number: ${phone.display_phone_number}`);
      console.log(`  Status: ${phone.verification_status}`);
      console.log();
    });
    
    console.log('📋 Update your .env file with:');
    console.log(`WHATSAPP_PHONE_NUMBER_ID=${response.data.data[0].id}`);
  } else {
    console.log('⚠️  No phone numbers found in this business account');
  }
})
.catch(error => {
  console.error('❌ Error fetching phone numbers:');
  console.error(`Status: ${error.response?.status}`);
  console.error(`Message: ${error.response?.data?.error?.message}`);
  console.error('\nFull error:', JSON.stringify(error.response?.data, null, 2));
});
