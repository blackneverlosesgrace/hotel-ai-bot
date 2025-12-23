#!/usr/bin/env node
// Test if webhook is receiving events from Meta
import axios from 'axios';

console.log('\n🧪 Testing Webhook Message Reception');
console.log('='.repeat(50));

const WEBHOOK_URL = 'https://hotel-ai-bot.onrender.com/webhook';

// Simulate Meta sending a message
const mockMessage = {
  object: 'whatsapp_business_account',
  entry: [{
    id: '123456',
    changes: [{
      value: {
        messaging_product: 'whatsapp',
        metadata: {
          display_phone_number: '919140818806',
          phone_number_id: '874331162435820'
        },
        messages: [{
          from: '919140818806',
          id: 'wamid.test123',
          timestamp: Date.now().toString().slice(0, -3),
          type: 'text',
          text: {
            body: 'Test message - नमस्ते'
          }
        }],
        contacts: [{
          profile: {
            name: 'Test User'
          },
          wa_id: '919140818806'
        }]
      },
      field: 'messages'
    }]
  }]
};

console.log('\n📤 Sending test message to webhook...\n');

try {
  const response = await axios.post(WEBHOOK_URL, mockMessage, {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  });

  console.log(`✓ Webhook received test message`);
  console.log(`✓ Response: ${response.status} ${response.statusText}`);
  console.log(`✓ Data: ${JSON.stringify(response.data)}`);
  
  console.log('\n✅ Webhook is working! Now check:');
  console.log('   1. Did the user appear in /users endpoint?');
  console.log('   2. Check Render logs for message processing');
  
} catch (error) {
  console.log(`✗ Webhook test failed: ${error.message}`);
  console.log(`✗ Status: ${error.response?.status || 'Unknown'}`);
  console.log(`✗ Error: ${error.response?.data || 'No response data'}`);
}

console.log('\n' + '='.repeat(50) + '\n');
