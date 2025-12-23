import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
const result = dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('=== ENV DEBUG ===');
console.log('dotenv.config result:', result.error ? result.error : 'Success');
console.log('WHATSAPP_PHONE_NUMBER_ID:', process.env.WHATSAPP_PHONE_NUMBER_ID);
console.log('WHATSAPP_API_TOKEN:', process.env.WHATSAPP_API_TOKEN ? '✓ SET' : '✗ MISSING');
console.log('WEBHOOK_VERIFY_TOKEN:', process.env.WEBHOOK_VERIFY_TOKEN ? '✓ SET' : '✗ MISSING');
console.log('================');
