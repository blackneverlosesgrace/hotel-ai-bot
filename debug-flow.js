#!/usr/bin/env node
// Debug script to test the entire message flow
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('\n🔍 Testing Full Message Flow');
console.log('='.repeat(60));

// Simulate what Meta sends
const mockWebhookPayload = {
  object: 'whatsapp_business_account',
  entry: [
    {
      id: 'entry_123',
      changes: [
        {
          value: {
            messaging_product: 'whatsapp',
            metadata: {
              display_phone_number: '919140818806',
              phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID
            },
            contacts: [
              {
                profile: { name: 'Test User' },
                wa_id: '919140818806'
              }
            ],
            messages: [
              {
                from: '919140818806',
                id: 'msg_test_123',
                timestamp: Date.now().toString(),
                type: 'text',
                text: {
                  body: 'नमस्ते'
                }
              }
            ]
          },
          field: 'messages'
        }
      ]
    }
  ]
};

console.log('\n[1] Mock Webhook Payload:');
console.log(JSON.stringify(mockWebhookPayload, null, 2));

console.log('\n[2] Sending to webhook...');
try {
  const response = await axios.post(
    'https://hotel-ai-bot.onrender.com/webhook',
    mockWebhookPayload,
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    }
  );
  
  console.log(`  ✓ Webhook response: ${response.status}`);
  console.log(`  ✓ Response body: ${response.data}`);
} catch (error) {
  console.log(`  ✗ Webhook failed: ${error.message}`);
  if (error.response) {
    console.log(`  ✗ Status: ${error.response.status}`);
    console.log(`  ✗ Data: ${JSON.stringify(error.response.data)}`);
  }
}

console.log('\n[3] Checking if message was recorded...');
try {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
  
  const response = await axios.get(
    'https://hotel-ai-bot.onrender.com/users/919140818806',
    { timeout: 5000 }
  );
  
  const user = response.data;
  console.log(`  ✓ User found`);
  console.log(`  ✓ State: ${user.state}`);
  console.log(`  ✓ Messages: ${user.conversationLength}`);
  console.log(`  ✓ Last messages: ${JSON.stringify(user.lastFiveMessages)}`);
} catch (error) {
  console.log(`  ✗ Failed to get user: ${error.message}`);
}

console.log('\n' + '='.repeat(60));
console.log('Test complete. Check above for errors.\n');
