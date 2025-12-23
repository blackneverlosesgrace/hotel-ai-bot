// User data storage and state management
// In production, replace with actual database (MongoDB, PostgreSQL, etc.)

const users = new Map(); // userId -> user data

export class UserStorage {
  // Initialize new user
  static initUser(phoneNumber) {
    const userId = phoneNumber;
    if (!users.has(userId)) {
      users.set(userId, {
        phoneNumber,
        state: 'START',
        bookingData: {
          checkinDate: null,
          checkoutDate: null,
          guestCount: null,
          roomType: null,
          location: null,
          paymentMethod: null,
          roomSelected: null,
          price: null
        },
        reminders: {
          inactiveReminders: 0,
          paymentReminders: 0
        },
        timestamps: {
          startedAt: Date.now(),
          lastActivityAt: Date.now(),
          paymentInitiatedAt: null
        },
        conversation: [] // Array of messages for context
      });
    }
    return users.get(userId);
  }

  // Get user data
  static getUser(phoneNumber) {
    const userId = phoneNumber;
    if (!users.has(userId)) {
      return this.initUser(phoneNumber);
    }
    return users.get(userId);
  }

  // Update user state
  static updateState(phoneNumber, newState) {
    const user = this.getUser(phoneNumber);
    user.state = newState;
    user.timestamps.lastActivityAt = Date.now();
    return user;
  }

  // Update booking data
  static updateBookingData(phoneNumber, data) {
    const user = this.getUser(phoneNumber);
    user.bookingData = { ...user.bookingData, ...data };
    user.timestamps.lastActivityAt = Date.now();
    return user;
  }

  // Add message to conversation history
  static addMessage(phoneNumber, role, content, messageType = 'text') {
    const user = this.getUser(phoneNumber);
    user.conversation.push({
      role, // 'user' or 'bot'
      content,
      messageType, // 'text' or 'image'
      timestamp: Date.now()
    });
    return user;
  }

  // Update reminder count
  static incrementReminder(phoneNumber, reminderType) {
    const user = this.getUser(phoneNumber);
    user.reminders[reminderType]++;
    return user;
  }

  // Reset reminder counts
  static resetReminders(phoneNumber) {
    const user = this.getUser(phoneNumber);
    user.reminders.inactiveReminders = 0;
    user.reminders.paymentReminders = 0;
    return user;
  }

  // Record payment initiation time
  static recordPaymentInitiation(phoneNumber) {
    const user = this.getUser(phoneNumber);
    user.timestamps.paymentInitiatedAt = Date.now();
    return user;
  }

  // Get all users (for admin/monitoring)
  static getAllUsers() {
    return Array.from(users.values());
  }

  // Get user by state
  static getUsersByState(state) {
    return Array.from(users.values()).filter(user => user.state === state);
  }

  // Clear user (for testing or cleanup)
  static clearUser(phoneNumber) {
    const userId = phoneNumber;
    users.delete(userId);
  }

  // Clear all users (for testing)
  static clearAll() {
    users.clear();
  }

  // Get conversation summary
  static getConversationSummary(phoneNumber) {
    const user = this.getUser(phoneNumber);
    return {
      phoneNumber: user.phoneNumber,
      currentState: user.state,
      bookingData: user.bookingData,
      conversationLength: user.conversation.length,
      sessionDuration: Date.now() - user.timestamps.startedAt,
      lastActivity: Date.now() - user.timestamps.lastActivityAt
    };
  }
}

export default UserStorage;
