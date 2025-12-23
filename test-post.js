import axios from 'axios';

const payload = {
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
          timestamp: Math.floor(Date.now() / 1000).toString(),
          type: 'text',
          text: { body: 'Test message - नमस्ते' }
        }],
        contacts: [{
          profile: { name: 'Test User' },
          wa_id: '919140818806'
        }]
      },
      field: 'messages'
    }]
  }]
};

console.log('🧪 Testing Webhook POST...\n');
const start = Date.now();

axios.post('https://hotel-ai-bot.onrender.com/webhook', payload, {
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})
.then(res => {
  const elapsed = Date.now() - start;
  console.log(`✓ Success (${elapsed}ms):`);
  console.log(`  Status: ${res.status}`);
  console.log(`  Response: ${JSON.stringify(res.data)}`);
})
.catch(err => {
  const elapsed = Date.now() - start;
  console.log(`✗ Failed (${elapsed}ms):`);
  console.log(`  Error: ${err.message}`);
  if (err.response) {
    console.log(`  Status: ${err.response.status}`);
    console.log(`  Data: ${JSON.stringify(err.response.data)}`);
  }
});
