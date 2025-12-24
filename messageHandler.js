// Message handling logic - processes messages based on state

import {
  STATES,
  ROOM_TYPES,
  PAYMENT_METHODS,
  REMINDER_CONFIG
} from './states.js';

import {
  validateDate,
  parseGuestCount,
  parseRoomType,
  parsePaymentMethod,
  getPrice,
  getRoomDetails,
  generateQRCodeURL,
  getMessageForState,
  getMessages
} from './utils.js';

import UserStorage from './userStorage.js';

const MESSAGES = getMessages();

export class MessageHandler {
  constructor(whatsappService) {
    this.whatsappService = whatsappService;
  }

  // Main handler for incoming messages
  async handleMessage(phoneNumber, message, messageType = 'text') {
    try {
      const user = UserStorage.getUser(phoneNumber);
      
      // Ensure user has a state initialized (default to START for new users)
      if (!user.state) {
        UserStorage.updateState(phoneNumber, STATES.START);
        user.state = STATES.START;
      }
      
      let response = null;
      let nextState = null;

      console.log(`\n🤖 Processing message for ${phoneNumber}:`);
      console.log(`   Message: ${message}`);
      console.log(`   Type: ${messageType}`);
      console.log(`   Current State: ${user.state}`);

      // Add message to conversation
      UserStorage.addMessage(phoneNumber, 'user', message, messageType);

      // Route based on message type and current state
      if (messageType === 'image') {
        ({ response, nextState } = await this.handleImageMessage(user));
      } else if (messageType === 'text') {
        ({ response, nextState } = await this.handleTextMessage(user, message));
      }

      // Update state if needed
      if (nextState) {
        console.log(`   Next State: ${nextState}`);
        UserStorage.updateState(phoneNumber, nextState);
      }

      // Send response
      if (response) {
        console.log(`   Bot Response: "${response.substring(0, 50)}..."`);
        const sendResult = await this.whatsappService.sendTextMessage(phoneNumber, response);
        if (sendResult.success) {
          console.log(`   ✓ Response sent successfully`);
          UserStorage.addMessage(phoneNumber, 'bot', response, 'text');
        } else {
          console.error(`   ✗ Failed to send response: ${sendResult.error}`);
        }
      }

      return { success: true, state: nextState || user.state };
    } catch (error) {
      console.error('Error handling message:', error);
      await this.whatsappService.sendTextMessage(phoneNumber, MESSAGES.error);
      return { success: false, error: error.message };
    }
  }

  // Handle text messages
  async handleTextMessage(user, text) {
    const cleanText = text.trim();
    const state = user.state;

    switch (state) {
      case STATES.START:
        return { response: MESSAGES.greeting, nextState: STATES.CHECKIN };

      case STATES.CHECKIN:
        return this.handleCheckInInput(user, cleanText);

      case STATES.CHECKOUT:
        return this.handleCheckOutInput(user, cleanText);

      case STATES.GUEST_COUNT:
        return this.handleGuestCountInput(user, cleanText);

      case STATES.STAY_TYPE:
        return this.handleStayTypeInput(user, cleanText);

      case STATES.LOCATION:
        return this.handleLocationInput(user, cleanText);

      case STATES.PAYMENT_CHOICE:
        return await this.handlePaymentChoiceInput(user, cleanText);

      case STATES.WAITING_SCREENSHOT:
        return {
          response: MESSAGES.textInImageState + '\n\n' + MESSAGES.screenshotInstructions,
          nextState: null
        };

      default:
        // Fallback: if state is undefined or unknown, treat as START
        return {
          response: MESSAGES.greeting,
          nextState: STATES.CHECKIN
        };
    }
  }

  // Handle image messages
  async handleImageMessage(user) {
    const state = user.state;

    if (state === STATES.WAITING_SCREENSHOT) {
      // Payment screenshot received
      const roomDetails = getRoomDetails(user.bookingData.guestCount);
      const confirmMsg = MESSAGES.screenshotReceived;

      return {
        response: confirmMsg,
        nextState: STATES.HUMAN_HANDOFF
      };
    } else {
      // Image in wrong state - ignore but ask to continue
      const currentPrompt = getMessageForState(state, user);
      return {
        response: MESSAGES.imageInWrongState + '\n\n' + currentPrompt,
        nextState: null
      };
    }
  }

  // Handle check-in date input
  handleCheckInInput(user, dateInput) {
    if (!validateDate(dateInput)) {
      return {
        response: MESSAGES.invalidDate + '\n\n' + MESSAGES.checkoutPrompt,
        nextState: null
      };
    }

    UserStorage.updateBookingData(user.phoneNumber, { checkinDate: dateInput });
    return {
      response: MESSAGES.checkoutPrompt,
      nextState: STATES.CHECKOUT
    };
  }

  // Handle check-out date input
  handleCheckOutInput(user, dateInput) {
    if (!validateDate(dateInput)) {
      return {
        response: MESSAGES.invalidDate + '\n\n' + MESSAGES.checkoutPrompt,
        nextState: null
      };
    }

    // Simple validation: checkout should be after checkin
    // In production, add proper date comparison logic
    UserStorage.updateBookingData(user.phoneNumber, { checkoutDate: dateInput });
    return {
      response: MESSAGES.guestCountPrompt,
      nextState: STATES.GUEST_COUNT
    };
  }

  // Handle guest count input
  handleGuestCountInput(user, input) {
    const guestCount = parseGuestCount(input);

    if (guestCount === null) {
      return {
        response: MESSAGES.invalidInput + '\n\n' + MESSAGES.guestCountPrompt,
        nextState: null
      };
    }

    UserStorage.updateBookingData(user.phoneNumber, { guestCount });
    return {
      response: MESSAGES.roomTypePrompt,
      nextState: STATES.STAY_TYPE
    };
  }

  // Handle stay type input
  handleStayTypeInput(user, input) {
    const roomType = parseRoomType(input);

    if (roomType === null) {
      return {
        response: MESSAGES.invalidInput + '\n\n' + MESSAGES.roomTypePrompt,
        nextState: null
      };
    }

    UserStorage.updateBookingData(user.phoneNumber, { roomType });
    return {
      response: MESSAGES.locationPrompt,
      nextState: STATES.LOCATION
    };
  }

  // Handle location input
  handleLocationInput(user, location) {
    if (!location || location.length < 2) {
      return {
        response: MESSAGES.invalidInput + '\n\n' + MESSAGES.locationPrompt,
        nextState: null
      };
    }

    const price = getPrice(user.bookingData.guestCount, user.bookingData.roomType);
    const roomDetails = getRoomDetails(user.bookingData.guestCount);

    UserStorage.updateBookingData(user.phoneNumber, {
      location,
      roomSelected: roomDetails.key,
      price
    });

    const priceMessage = MESSAGES.priceShown(
      user.bookingData.roomType,
      price,
      roomDetails.name
    );

    return {
      response: priceMessage,
      nextState: STATES.PRICE_SHARED
    };
  }

  // Handle payment choice input
  async handlePaymentChoiceInput(user, input) {
    const paymentMethod = parsePaymentMethod(input);

    if (paymentMethod === null) {
      const priceMessage = MESSAGES.priceShown(
        user.bookingData.roomType,
        user.bookingData.price,
        getRoomDetails(user.bookingData.guestCount).name
      );
      return {
        response: MESSAGES.invalidInput + '\n\n' + priceMessage,
        nextState: null
      };
    }

    UserStorage.updateBookingData(user.phoneNumber, { paymentMethod });
    UserStorage.recordPaymentInitiation(user.phoneNumber);

    if (paymentMethod === PAYMENT_METHODS.ONLINE) {
      // Send QR code
      const qrUrl = generateQRCodeURL(user.bookingData.price);
      
      // Send text message with QR code instructions
      await this.whatsappService.sendTextMessage(user.phoneNumber, MESSAGES.qrMessage);
      
      // Try to send QR code image
      await this.whatsappService.sendImageMessage(
        user.phoneNumber,
        qrUrl,
        'Payment QR Code - scan to pay'
      );

      UserStorage.addMessage(user.phoneNumber, 'bot', MESSAGES.qrMessage, 'text');

      return {
        response: MESSAGES.screenshotInstructions,
        nextState: STATES.WAITING_SCREENSHOT
      };
    } else {
      // Hotel payment - direct to human handoff
      return {
        response: MESSAGES.humanHandoff,
        nextState: STATES.HUMAN_HANDOFF
      };
    }
  }

  // Handle timeout/reminder scenarios
  async handleReminder(phoneNumber, reminderType) {
    const user = UserStorage.getUser(phoneNumber);

    if (reminderType === 'paymentScreenshot') {
      if (user.reminders.paymentReminders < REMINDER_CONFIG.MAX_REMINDERS) {
        UserStorage.incrementReminder(phoneNumber, 'paymentReminders');
        await this.whatsappService.sendTextMessage(
          phoneNumber,
          MESSAGES.remindPayment
        );
        return { sent: true, count: user.reminders.paymentReminders };
      }
    } else if (reminderType === 'inactiveBooking') {
      if (user.reminders.inactiveReminders < REMINDER_CONFIG.MAX_REMINDERS) {
        UserStorage.incrementReminder(phoneNumber, 'inactiveReminders');
        await this.whatsappService.sendTextMessage(
          phoneNumber,
          MESSAGES.remindBooking
        );
        return { sent: true, count: user.reminders.inactiveReminders };
      }
    }

    return { sent: false, maxReached: true };
  }
}

export default MessageHandler;
