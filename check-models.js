#!/usr/bin/env node
// Check available Groq models
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });

const GROQ_API_KEY = process.env.GROQ_API_KEY?.trim();

if (!GROQ_API_KEY) {
  console.log('❌ No GROQ_API_KEY found');
  process.exit(1);
}

try {
  console.log('🔍 Checking available Groq models...');

  const response = await axios.get('https://api.groq.com/openai/v1/models', {
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  });

  console.log('✅ Available models:');
  response.data.data.forEach(model => {
    console.log(`  - ${model.id}`);
  });

} catch (error) {
  console.error('❌ Error:', error.response?.data || error.message);
}
