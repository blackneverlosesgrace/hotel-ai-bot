// Conversation states for the hotel booking chatbot
export const STATES = {
  START: 'START',
  CHECKIN: 'CHECKIN',
  CHECKOUT: 'CHECKOUT',
  GUEST_COUNT: 'GUEST_COUNT',
  STAY_TYPE: 'STAY_TYPE',
  LOCATION: 'LOCATION',
  PRICE_SHARED: 'PRICE_SHARED',
  PAYMENT_CHOICE: 'PAYMENT_CHOICE',
  WAITING_SCREENSHOT: 'WAITING_SCREENSHOT',
  HUMAN_HANDOFF: 'HUMAN_HANDOFF',
  CONFIRMED: 'CONFIRMED'
};

// Room type options
export const ROOM_TYPES = {
  FULL_DAY: '24_hours',
  HOURLY: '6_hours'
};

// Payment method options
export const PAYMENT_METHODS = {
  ONLINE: 'online',
  AT_HOTEL: 'at_hotel'
};

// State transition map
export const STATE_FLOW = {
  [STATES.START]: STATES.CHECKIN,
  [STATES.CHECKIN]: STATES.CHECKOUT,
  [STATES.CHECKOUT]: STATES.GUEST_COUNT,
  [STATES.GUEST_COUNT]: STATES.STAY_TYPE,
  [STATES.STAY_TYPE]: STATES.LOCATION,
  [STATES.LOCATION]: STATES.PRICE_SHARED,
  [STATES.PRICE_SHARED]: STATES.PAYMENT_CHOICE,
  [STATES.PAYMENT_CHOICE]: [STATES.WAITING_SCREENSHOT, STATES.HUMAN_HANDOFF], // Based on payment method
  [STATES.WAITING_SCREENSHOT]: STATES.HUMAN_HANDOFF,
  [STATES.HUMAN_HANDOFF]: STATES.CONFIRMED,
  [STATES.CONFIRMED]: null // End state
};

// Reminder timings (in milliseconds)
export const REMINDER_CONFIG = {
  INACTIVE_TIMEOUT: 60 * 60 * 1000, // 1 hour
  PAYMENT_SCREENSHOT_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_REMINDERS: 2
};

// Sample hotel rooms data
export const HOTEL_ROOMS = {
  standard: {
    name: 'Standard Room',
    capacity: 2,
    amenities: ['AC', 'WiFi', 'TV', 'Bathroom']
  },
  deluxe: {
    name: 'Deluxe Room',
    capacity: 3,
    amenities: ['AC', 'WiFi', 'TV', 'Bathroom', 'Mini Bar']
  },
  suite: {
    name: 'Suite',
    capacity: 4,
    amenities: ['AC', 'WiFi', 'TV', 'Bathroom', 'Mini Bar', 'Living Area']
  }
};

// Pricing configuration (mock)
export const PRICING = {
  standard: { fullDay: 699, hourly: 150 },
  deluxe: { fullDay: 999, hourly: 200 },
  suite: { fullDay: 1299, hourly: 250 }
};
