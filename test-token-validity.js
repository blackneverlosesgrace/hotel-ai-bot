import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TOKEN = process.env.WHATSAPP_API_TOKEN;
const BUSINESS_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

console.log('\n🔍 Testing Token Validity\n');
console.log('Business ID:', BUSINESS_ID);
console.log('Phone ID:', PHONE_ID);
console.log('Token:', TOKEN.substring(0, 20) + '...');

// Test 1: Business Account endpoint
console.log('\n1️⃣  Testing Business Account endpoint...');
axios.get(`https://graph.instagram.com/v18.0/${BUSINESS_ID}`, {
  params: { access_token: TOKEN },
  timeout: 5000
})
.then(res => {
  console.log('✅ Business Account accessible');
})
.catch(err => {
  console.log('❌ Business Account failed:', err.response?.data?.error?.code, err.response?.data?.error?.message);
});

// Test 2: Try to get phone numbers
setTimeout(() => {
  console.log('\n2️⃣  Testing phone numbers endpoint...');
  axios.get(`https://graph.instagram.com/v18.0/${BUSINESS_ID}/phone_numbers`, {
    params: { access_token: TOKEN },
    timeout: 5000
  })
  .then(res => {
    console.log('✅ Phone numbers accessible');
    console.log('Found:', res.data.data.length, 'phone numbers');
    if (res.data.data.length > 0) {
      console.log('First phone ID:', res.data.data[0].id);
    }
  })
  .catch(err => {
    console.log('❌ Phone numbers failed:', err.response?.data?.error?.code, err.response?.data?.error?.message);
  });
}, 1000);
