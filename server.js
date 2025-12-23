// Main Express server with WhatsApp webhook handlers

import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Import local modules
import { config, validateConfig } from './config.js';
import WhatsAppService from './whatsappService.js';
import MessageHandler from './messageHandler.js';
import ReminderService from './reminderService.js';
import UserStorage from './userStorage.js';
import { STATES } from './states.js';

// Validate configuration
try {
  validateConfig();
} catch (error) {
  console.error('Configuration Error:', error.message);
  process.exit(1);
}

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Store raw body for webhook signature verification
app.use((req, res, next) => {
  let rawBody = '';
  req.on('data', chunk => {
    rawBody += chunk.toString('utf8');
  });
  req.on('end', () => {
    req.rawBody = rawBody;
    next();
  });
});

// Initialize services
const whatsappService = new WhatsAppService(
  config.whatsapp.phoneNumberId,
  config.whatsapp.accessToken
);

const messageHandler = new MessageHandler(whatsappService);
const reminderService = new ReminderService(whatsappService);

// Start reminder service
reminderService.startReminderCheck();

// ============================================
// WEBHOOK ENDPOINTS
// ============================================

/**
 * GET /webhook
 * Webhook verification endpoint
 * Called by Meta to verify webhook configuration
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  // Verify webhook token
  if (mode === 'subscribe' && token === config.webhook.verifyToken) {
    console.log('✓ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.error('✗ Webhook verification failed');
    res.status(403).send('Forbidden');
  }
});

/**
 * POST /webhook
 * Main webhook endpoint to receive messages from WhatsApp
 * Processes incoming messages and responds accordingly
 */
app.post('/webhook', async (req, res) => {
  // Webhook must respond within 10 seconds
  // Send 200 OK immediately, then process asynchronously
  res.status(200).send('EVENT_RECEIVED');

  try {
    const body = req.body;

    // Validate webhook payload
    if (body.object !== 'whatsapp_business_account') {
      console.log('Ignored non-whatsapp event:', body.object);
      return;
    }

    // Process each entry
    if (!body.entry || !Array.isArray(body.entry)) {
      return;
    }

    for (const entry of body.entry) {
      // Process changes
      if (!entry.changes || !Array.isArray(entry.changes)) {
        continue;
      }

      for (const change of entry.changes) {
        if (change.field !== 'messages') {
          continue;
        }

        // Process the message change
        await processMessageChange(change.value);
      }
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
  }
});

/**
 * Process incoming message from WhatsApp
 */
async function processMessageChange(messageChange) {
  try {
    if (!messageChange.messages || messageChange.messages.length === 0) {
      return;
    }

    const message = messageChange.messages[0];
    const phoneNumber = messageChange.contacts[0].wa_id;
    const messageId = message.id;

    console.log(`\n📨 Incoming message from ${phoneNumber}`);
    console.log(`Message ID: ${messageId}`);
    console.log(`Type: ${message.type}`);

    // Mark message as read
    await whatsappService.markMessageAsRead(messageId);

    // Route based on message type
    let messageContent = '';
    let messageType = 'text';

    if (message.type === 'text') {
      messageContent = message.text.body;
      messageType = 'text';
    } else if (message.type === 'image') {
      messageContent = 'payment_screenshot';
      messageType = 'image';
      console.log('📸 Image received (payment screenshot)');
    } else if (message.type === 'audio') {
      messageContent = 'audio_message';
      messageType = 'audio';
    } else if (message.type === 'document') {
      messageContent = 'document';
      messageType = 'document';
    } else {
      console.log(`Unsupported message type: ${message.type}`);
      return;
    }

    // Get user and current state
    const user = UserStorage.getUser(phoneNumber);
    console.log(`Current state: ${user.state}`);

    // Process message
    const result = await messageHandler.handleMessage(
      phoneNumber,
      messageContent,
      messageType
    );

    if (result.success) {
      console.log(`✓ Message processed. New state: ${result.state}`);

      // If moved to human handoff, trigger notification
      if (result.state === STATES.HUMAN_HANDOFF) {
        console.log('🔔 Triggering human handoff...');
        await reminderService.triggerHumanHandoff(phoneNumber);

        // Send final confirmation to user
        const confirmMessage = `✅ बहुत अच्छा!

आपकी बुकिंग की जानकारी होटल टीम को भेज दी गई है।
कुछ ही मिनटों में आपको कॉल आएगा।

धन्यवाद! 🙏`;
        await whatsappService.sendTextMessage(phoneNumber, confirmMessage);
        UserStorage.updateState(phoneNumber, STATES.CONFIRMED);
      }
    } else {
      console.error(`✗ Error processing message:`, result.error);
    }
  } catch (error) {
    console.error('Error in processMessageChange:', error);
  }
}

// ============================================
// ADMIN & MONITORING ENDPOINTS
// ============================================

/**
 * GET /status
 * Check bot status and statistics
 */
app.get('/status', (req, res) => {
  const users = UserStorage.getAllUsers();
  const stateDistribution = {};

  users.forEach(user => {
    stateDistribution[user.state] = (stateDistribution[user.state] || 0) + 1;
  });

  res.json({
    status: 'operational',
    timestamp: new Date().toISOString(),
    users: {
      total: users.length,
      stateDistribution
    },
    service: {
      whatsapp: 'connected',
      reminders: 'active'
    }
  });
});

/**
 * GET /users
 * List all users and their states (for admin/monitoring)
 */
app.get('/users', (req, res) => {
  const users = UserStorage.getAllUsers();
  const userSummaries = users.map(user => ({
    phoneNumber: user.phoneNumber,
    state: user.state,
    bookingData: user.bookingData,
    sessionDuration: Date.now() - user.timestamps.startedAt,
    lastActivity: Date.now() - user.timestamps.lastActivityAt
  }));

  res.json({
    total: userSummaries.length,
    users: userSummaries
  });
});

/**
 * GET /users/:phoneNumber
 * Get specific user details
 */
app.get('/users/:phoneNumber', (req, res) => {
  const phoneNumber = req.params.phoneNumber;
  const user = UserStorage.getUser(phoneNumber);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    phoneNumber: user.phoneNumber,
    state: user.state,
    bookingData: user.bookingData,
    reminders: user.reminders,
    timestamps: user.timestamps,
    conversationLength: user.conversation.length,
    lastFiveMessages: user.conversation.slice(-5)
  });
});

/**
 * POST /test-message
 * Send test message to a phone number (for testing)
 */
app.post('/test-message', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber || !message) {
    return res.status(400).json({ error: 'phoneNumber and message required' });
  }

  const result = await whatsappService.sendTextMessage(phoneNumber, message);

  if (result.success) {
    res.json({
      success: true,
      messageId: result.messageId,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error
    });
  }
});

/**
 * POST /reset-user
 * Reset user state (for testing)
 */
app.post('/reset-user', (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber required' });
  }

  UserStorage.clearUser(phoneNumber);
  res.json({
    success: true,
    message: `User ${phoneNumber} has been reset`
  });
});

/**
 * POST /send-test-flow
 * Test the entire conversation flow with a phone number
 */
app.post('/send-test-flow', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ error: 'phoneNumber required' });
  }

  // Reset user
  UserStorage.clearUser(phoneNumber);

  // Send greeting
  const greeting = `🙏 नमस्ते! 

होटल बुकिंग के लिए आपका स्वागत है।
आपकी बुकिंग को पूरा करने में हमें खुशी होगी।

कृपया अपनी चेक-इन डेट बताएं (DD-MM-YYYY format में):`;

  const result = await whatsappService.sendTextMessage(phoneNumber, greeting);

  if (result.success) {
    res.json({
      success: true,
      message: 'Test flow started',
      messageId: result.messageId
    });
  } else {
    res.status(500).json({
      success: false,
      error: result.error
    });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

/**
 * 404 handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
    method: req.method
  });
});

/**
 * Error handler
 */
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const PORT = config.server.port;

app.listen(PORT, () => {
  console.log('\n🤖 WhatsApp Hotel Booking Bot Started');
  console.log('='.repeat(50));
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Webhook: http://localhost:${PORT}/webhook`);
  console.log(`✓ Status: http://localhost:${PORT}/status`);
  console.log(`✓ Node Environment: ${config.server.env}`);
  console.log(`✓ WhatsApp Phone ID: ${config.whatsapp.phoneNumberId}`);
  console.log('='.repeat(50));
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /webhook              - Webhook verification');
  console.log('  POST /webhook              - Receive messages');
  console.log('  GET  /status               - Bot status');
  console.log('  GET  /users                - List all users');
  console.log('  GET  /users/:phoneNumber   - Get user details');
  console.log('  POST /test-message         - Send test message');
  console.log('  POST /reset-user           - Reset user state');
  console.log('  POST /send-test-flow       - Start test flow');
  console.log('\n⏰ Reminder service active\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  reminderService.stopReminderCheck();
  process.exit(0);
});

export default app;
