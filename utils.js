// Utility functions and message templates

import { STATES, ROOM_TYPES, PAYMENT_METHODS, HOTEL_ROOMS, PRICING } from './states.js';

// Messages in Hindi/Hinglish
const MESSAGES = {
  greeting: `🙏 नमस्ते! 

होटल बुकिंग के लिए आपका स्वागत है।
आपकी बुकिंग को पूरा करने में हमें खुशी होगी।

कृपया अपनी चेक-इन डेट बताएं (DD-MM-YYYY format में):`,

  checkoutPrompt: `✅ धन्यवाद!

अब कृपया अपनी चेक-आउट डेट बताएं (DD-MM-YYYY format में):`,

  guestCountPrompt: `✅ शानदार!

कितने लोग ठहरेंगे? कृपया अपना विकल्प चुनें:

1️⃣ 1 मेहमान
2️⃣ 2 मेहमान
3️⃣ 3 मेहमान
4️⃣ 4 मेहमान`,

  roomTypePrompt: `✅ बहुत अच्छा!

कृपया कमरे का प्रकार चुनें:

1️⃣ 24 घंटे की स्टे (Full Day)
2️⃣ 6 घंटे की स्टे (Hourly Room)`,

  locationPrompt: `✅ धन्यवाद!

अपने पसंदीदा इलाके या लैंडमार्क का नाम बताएं:

उदाहरण: Bandra, Andheri, Airport, Railway Station, etc.`,

  priceShown: (roomType, price, roomName) => `✅ बहुत अच्छा!

आपके लिए उपलब्ध:

🏨 ${roomName}
💰 Price: ₹${price}
📅 ${roomType === ROOM_TYPES.FULL_DAY ? '24 घंटे' : '6 घंटे'}

कृपया पेमेंट का तरीका चुनें:

1️⃣ Online Payment (QR Code)
2️⃣ Hotel पर Payment करें`,

  qrMessage: `✅ धन्यवाद!

नीचे QR Code से payment पूरा करें। 👇

[QR Code Image Placeholder: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=UPI%3Aupi%3A%2F%2Fpay%3Fpa%3Dmerchant%40upi%26pn%3DHotel%20Booking%26am%3D699%26tn%3DHotel%20Booking]

Payment के बाद कृपया Payment Receipt/Screenshot यहाँ भेजें। 📸`,

  screenshotInstructions: `✅ Payment पूरा हो गई?

कृपया Payment Receipt का Screenshot यहाँ भेजें। 📸`,

  screenshotReceived: `🎉 धन्यवाद!

आपकी Payment Receipt प्राप्त हुई।
हमारा टीम आपसे कुछ ही मिनटों में संपर्क करेगा।

📞 होटल टीम से कॉल के लिए तैयार रहें।`,

  hotelPaymentConfirm: `🎉 बहुत अच्छा!

आपकी बुकिंग होटल में confirm हो गई।
होटल में Arrival के समय Payment करें।

📞 होटल टीम से कुछ ही मिनटों में आपको कॉल आएगा।

Booking Details:
- Check-in: {checkin}
- Check-out: {checkout}
- Guests: {guests}
- Room: {room}`,

  humanHandoff: `📞 होटल टीम से संपर्क

आपकी बुकिंग की जानकारी होटल टीम को भेज दी गई है।
कुछ ही मिनटों में आपको कॉल आएगा।

धन्यवाद! 🙏`,

  bookingConfirmed: `✅ आपकी बुकिंग Confirm हो गई!

Booking Details:
- Check-in: {checkin}
- Check-out: {checkout}
- Guests: {guests}
- Room: {room}
- Total Price: ₹{price}

होटल टीम आपसे जल्द संपर्क करेगा। 📞`,

  invalidInput: `❌ क्षमा करें!

कृपया सही विकल्प चुनें। नीचे दिए गए विकल्पों में से कोई एक चुनें।`,

  invalidDate: `❌ क्षमा करें!

कृपया सही Date Format में भेजें (DD-MM-YYYY)।
उदाहरण: 25-12-2025`,

  waitingScreenshot: `📸 Payment Screenshot के लिए प्रतीक्षा कर रहे हैं...

कृपया Payment Receipt का Screenshot भेजें।`,

  remindPayment: `⏰ Gentle Reminder

अभी तक Payment का Screenshot नहीं मिला।
कृपया Payment पूरा करने के बाद Screenshot भेजें। 📸`,

  remindBooking: `⏰ Gentle Reminder

आपकी बुकिंग अभी अधूरी है।
कृपया अपनी यात्रा की जानकारी पूरी करने में हमें मदद करें। 🏨`,

  imageInWrongState: `📸 एक क्षण!

अभी तो हमें Image की जरूरत नहीं है।
कृपया आगे बढ़ने के लिए नीचे दिया गया जवाब दें:`,

  textInImageState: `❌ कृपया Screenshot भेजें!

हमें Payment Receipt का Screenshot चाहिए।
कुछ भी टाइप न करें, सीधे Image भेजें। 📸`,

  error: `❌ क्षमा करें!

एक तकनीकी समस्या हुई है।
कृपया दोबारा कोशिश करें।`
};

// Date validation
export function validateDate(dateString) {
  try {
    const [day, month, year] = dateString.split('-').map(Number);
    
    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2025) {
      return false;
    }
    
    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1;
  } catch {
    return false;
  }
}

// Parse guest count from user input
export function parseGuestCount(input) {
  const cleanInput = input.trim().toLowerCase();
  if (['1', 'एक', 'one'].includes(cleanInput)) return 1;
  if (['2', 'दो', 'two'].includes(cleanInput)) return 2;
  if (['3', 'तीन', 'three'].includes(cleanInput)) return 3;
  if (['4', 'चार', 'four'].includes(cleanInput)) return 4;
  return null;
}

// Parse room type from user input
export function parseRoomType(input) {
  const cleanInput = input.trim().toLowerCase();
  if (['1', 'fullday', '24', '24hour', 'पूरा दिन'].includes(cleanInput)) {
    return ROOM_TYPES.FULL_DAY;
  }
  if (['2', 'hourly', '6', '6hour', 'घंटे'].includes(cleanInput)) {
    return ROOM_TYPES.HOURLY;
  }
  return null;
}

// Parse payment method from user input
export function parsePaymentMethod(input) {
  const cleanInput = input.trim().toLowerCase();
  if (['1', 'online', 'qr'].includes(cleanInput)) {
    return PAYMENT_METHODS.ONLINE;
  }
  if (['2', 'hotel', 'at_hotel', 'होटल'].includes(cleanInput)) {
    return PAYMENT_METHODS.AT_HOTEL;
  }
  return null;
}

// Select appropriate room based on guest count
export function selectRoom(guestCount) {
  if (guestCount === 1) return 'standard';
  if (guestCount === 2) return 'deluxe';
  return 'suite';
}

// Get price for selected options
export function getPrice(guestCount, roomType) {
  const room = selectRoom(guestCount);
  const priceType = roomType === ROOM_TYPES.FULL_DAY ? 'fullDay' : 'hourly';
  return PRICING[room][priceType];
}

// Get room details
export function getRoomDetails(guestCount) {
  const roomKey = selectRoom(guestCount);
  return {
    key: roomKey,
    ...HOTEL_ROOMS[roomKey]
  };
}

// Generate QR code URL (placeholder using third-party service)
export function generateQRCodeURL(amount = 699) {
  // Using third-party QR code service for UPI payment
  const upiString = `upi://pay?pa=merchant@upi&pn=HotelBooking&am=${amount}&tn=HotelBooking`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiString)}`;
}

// Format booking confirmation message
export function formatBookingConfirmation(userData) {
  const booking = userData.bookingData;
  const roomDetails = getRoomDetails(booking.guestCount);
  
  return MESSAGES.bookingConfirmed
    .replace('{checkin}', booking.checkinDate)
    .replace('{checkout}', booking.checkoutDate)
    .replace('{guests}', booking.guestCount)
    .replace('{room}', roomDetails.name)
    .replace('{price}', booking.price);
}

// Get message by state
export function getMessageForState(state, userData = null) {
  switch (state) {
    case STATES.START:
      return MESSAGES.greeting;
    case STATES.CHECKIN:
      return MESSAGES.checkoutPrompt;
    case STATES.GUEST_COUNT:
      return MESSAGES.guestCountPrompt;
    case STATES.STAY_TYPE:
      return MESSAGES.roomTypePrompt;
    case STATES.LOCATION:
      return MESSAGES.locationPrompt;
    case STATES.PRICE_SHARED:
      if (userData) {
        const roomDetails = getRoomDetails(userData.bookingData.guestCount);
        return MESSAGES.priceShown(
          userData.bookingData.roomType,
          userData.bookingData.price,
          roomDetails.name
        );
      }
      return MESSAGES.error;
    case STATES.PAYMENT_CHOICE:
      return MESSAGES.qrMessage;
    case STATES.WAITING_SCREENSHOT:
      return MESSAGES.screenshotInstructions;
    case STATES.HUMAN_HANDOFF:
      return MESSAGES.humanHandoff;
    case STATES.CONFIRMED:
      return userData ? formatBookingConfirmation(userData) : MESSAGES.bookingConfirmed;
    default:
      return MESSAGES.error;
  }
}

// Get all message templates
export function getMessages() {
  return MESSAGES;
}

export default {
  MESSAGES,
  validateDate,
  parseGuestCount,
  parseRoomType,
  parsePaymentMethod,
  selectRoom,
  getPrice,
  getRoomDetails,
  generateQRCodeURL,
  formatBookingConfirmation,
  getMessageForState
};
