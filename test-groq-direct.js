#!/usr/bin/env node
// Direct test of Groq service without server
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

import groqService from './groqService.js';

console.log('🧪 Testing Groq Service Directly...\n');

const testMessage = 'hello, I need a hotel room for 2 people';
const userContext = {
  bookingData: {},
  conversation: []
};

try {
  console.log('📝 User message:', testMessage);
  console.log('🔄 Calling Groq...');

  const result = await groqService.generateResponse(testMessage, userContext);

  console.log('\n✅ SUCCESS!');
  console.log('🤖 AI Response:', result.response);
  console.log('📊 Extracted Data:', JSON.stringify(result.extractedData, null, 2));

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('Full error:', error);
}
