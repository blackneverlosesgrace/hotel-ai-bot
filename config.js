// Configuration file - environment variables and constants

export const config = {
  // WhatsApp API Configuration
  whatsapp: {
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
    accessToken: process.env.WHATSAPP_API_TOKEN,
    apiVersion: 'v18.0'
  },

  // Webhook Configuration
  webhook: {
    verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
    port: process.env.PORT || 3000,
    path: '/webhook'
  },

  // Server Configuration
  server: {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    timeout: 10000 // 10 seconds for webhook response
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'json'
  },

  // Feature flags
  features: {
    remindersEnabled: true,
    screenshotValidation: false, // No ML validation, just acceptance
    hotelCallNotification: true
  }
};

// Validate required config
export function validateConfig() {
  const required = [
    'WHATSAPP_PHONE_NUMBER_ID',
    'WHATSAPP_API_TOKEN',
    'WEBHOOK_VERIFY_TOKEN'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  console.log('✓ Configuration validated');
}

export default config;
