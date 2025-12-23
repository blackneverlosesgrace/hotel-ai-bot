#!/usr/bin/env node
// Comprehensive code audit to find bugs
console.log('\n🔍 Code Audit - Looking for Bugs');
console.log('='.repeat(60));

// Issue 1: Check messageChange structure
console.log('\n[1] Checking messageChange structure in server.js');
console.log('   Expected: { messaging_product, metadata, messages[], contacts[] }');
console.log('   Line 119: await processMessageChange(change.value)');
console.log('   ✓ change.value should contain correct structure');

// Issue 2: Check webhook token
console.log('\n[2] Checking webhook token validation');
console.log('   config.webhook.verifyToken should match env token');
console.log('   Current: Check if .env has correct token');

// Issue 3: Check if responses are being sent
console.log('\n[3] Checking response sending in messageHandler.js');
console.log('   Line 51-55: Response is sent via:');
console.log('   await this.whatsappService.sendTextMessage(phoneNumber, response)');
console.log('   ✓ This looks correct');

// Issue 4: Check WhatsApp API calls
console.log('\n[4] Checking WhatsApp API sendTextMessage');
console.log('   URL: ${BASE_URL}/${this.phoneNumberId}/messages');
console.log('   phoneNumberId should be: 874331162435820');
console.log('   accessToken should be valid');

// Issue 5: Check server startup
console.log('\n[5] Checking server startup');
console.log('   app.listen() should be called at end of server.js');
console.log('   Currently need to verify this is present');

console.log('\n' + '='.repeat(60));
console.log('Check server.js end of file for app.listen() call!\n');
