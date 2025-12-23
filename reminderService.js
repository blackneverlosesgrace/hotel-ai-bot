// Reminder service - handles follow-ups for inactive users and pending payments

import { REMINDER_CONFIG, STATES } from './states.js';
import UserStorage from './userStorage.js';
import MessageHandler from './messageHandler.js';

export class ReminderService {
  constructor(whatsappService) {
    this.whatsappService = whatsappService;
    this.messageHandler = new MessageHandler(whatsappService);
    this.reminders = new Map(); // Track active reminders
  }

  // Start checking for reminders
  startReminderCheck() {
    // Check every 5 minutes for reminders
    setInterval(() => this.checkAllReminders(), 5 * 60 * 1000);
    console.log('Reminder service started');
  }

  // Check all users for reminders needed
  async checkAllReminders() {
    const users = UserStorage.getAllUsers();
    const now = Date.now();

    for (const user of users) {
      // Skip if already confirmed or in end state
      if (user.state === STATES.CONFIRMED || user.state === STATES.HUMAN_HANDOFF) {
        continue;
      }

      const lastActivity = now - user.timestamps.lastActivityAt;
      const paymentInitiated = user.timestamps.paymentInitiatedAt;

      // Check for inactive booking reminder (1 hour)
      if (
        lastActivity > REMINDER_CONFIG.INACTIVE_TIMEOUT &&
        user.state !== STATES.WAITING_SCREENSHOT &&
        user.state !== STATES.HUMAN_HANDOFF
      ) {
        await this.messageHandler.handleReminder(
          user.phoneNumber,
          'inactiveBooking'
        );
      }

      // Check for payment screenshot reminder (30 minutes after payment initiated)
      if (
        paymentInitiated &&
        user.state === STATES.WAITING_SCREENSHOT &&
        now - paymentInitiated > REMINDER_CONFIG.PAYMENT_SCREENSHOT_TIMEOUT
      ) {
        await this.messageHandler.handleReminder(
          user.phoneNumber,
          'paymentScreenshot'
        );
      }
    }
  }

  // Trigger human call notification for hotel team
  async triggerHumanHandoff(phoneNumber) {
    const user = UserStorage.getUser(phoneNumber);

    // Log notification for hotel team
    const notification = {
      timestamp: new Date().toISOString(),
      phoneNumber: user.phoneNumber,
      bookingData: user.bookingData,
      paymentMethod: user.bookingData.paymentMethod,
      conversationHistory: user.conversation
    };

    // Log to console (in production, send to hotel team dashboard/email/webhook)
    console.log('='.repeat(60));
    console.log('🔔 HUMAN HANDOFF NOTIFICATION - Call Hotel Team!');
    console.log('='.repeat(60));
    console.log(JSON.stringify(notification, null, 2));
    console.log('='.repeat(60));

    // Here you would:
    // 1. Send webhook to hotel management system
    // 2. Send email to hotel team
    // 3. Create CRM entry
    // 4. Log to database
    // 5. Trigger SMS/WhatsApp to hotel team

    return notification;
  }

  // Format human handoff notification
  formatHandoffNotification(user) {
    const booking = user.bookingData;
    const roomDetails = getRoomDetails(booking.guestCount);

    const notification = `
📞 NEW BOOKING NOTIFICATION

Customer Phone: ${user.phoneNumber}
Check-in: ${booking.checkinDate}
Check-out: ${booking.checkoutDate}
Guests: ${booking.guestCount}
Room Type: ${booking.roomType}
Location: ${booking.location}
Room Selected: ${roomDetails.name}
Price: ₹${booking.price}
Payment Method: ${booking.paymentMethod === 'online' ? 'Online Payment' : 'Hotel Payment'}
Status: Ready for call

Action Required: Call customer within 5 minutes
    `;

    return notification;
  }

  // Stop reminder checks
  stopReminderCheck() {
    console.log('Reminder service stopped');
  }

  // Send welcome back message after reminder
  async sendWelcomeBack(phoneNumber) {
    const message = `👋 आपका स्वागत है!

अभी भी बुकिंग के लिए तैयार हैं?
आइए जहाँ रुके थे वहाँ से शुरू करते हैं।`;

    await this.whatsappService.sendTextMessage(phoneNumber, message);
  }

  // Get reminder statistics
  getReminders() {
    return Array.from(this.reminders.entries()).map(([phoneNumber, reminder]) => ({
      phoneNumber,
      ...reminder
    }));
  }

  // Clear expired reminders
  async clearExpiredReminders() {
    const now = Date.now();
    for (const [phoneNumber, reminder] of this.reminders.entries()) {
      if (now - reminder.createdAt > 24 * 60 * 60 * 1000) {
        // Remove reminders older than 24 hours
        this.reminders.delete(phoneNumber);
      }
    }
  }
}

export default ReminderService;

// Helper function (imported from utils in actual implementation)
function getRoomDetails(guestCount) {
  if (guestCount === 1) return { name: 'Standard Room' };
  if (guestCount === 2) return { name: 'Deluxe Room' };
  return { name: 'Suite' };
}
