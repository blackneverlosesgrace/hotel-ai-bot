// Groq AI Service for natural language chat
// Handles AI-powered conversations while extracting booking data

import axios from 'axios';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export class GroqService {
  constructor() {
    if (!GROQ_API_KEY) {
      console.warn('⚠️ GROQ_API_KEY not set - AI chat disabled');
    }
  }

  /**
   * Generate AI response using Groq
   * @param {string} userMessage - User's message
   * @param {Object} userContext - User's booking data and conversation history
   * @returns {Promise<{response: string, extractedData: Object}>}
   */
  async generateResponse(userMessage, userContext = {}) {
    if (!GROQ_API_KEY) {
      return {
        response: '🙏 नमस्ते! कृपया होटल बुकिंग के लिए अपनी जानकारी साझा करें।',
        extractedData: {}
      };
    }

    try {
      // Build conversation history
      const messages = this.buildMessages(userMessage, userContext);

      const response = await axios.post(
        GROQ_API_URL,
        {
          model: 'mixtral-8x7b-32768', // Fast & powerful free model
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      const aiResponse = response.data.choices[0].message.content;
      const extractedData = this.extractBookingData(userMessage, aiResponse, userContext);

      return {
        response: aiResponse,
        extractedData: extractedData
      };
    } catch (error) {
      console.error('Groq API error:', error.message);
      return {
        response: '😊 मुझे समझ नहीं आया। कृपया दोबारा कहें।',
        extractedData: {}
      };
    }
  }

  /**
   * Build message history for Groq context
   */
  buildMessages(userMessage, userContext) {
    const systemPrompt = `तुम एक होटल बुकिंग सहायक हो। यह निम्नलिखित जानकारी सभी करने में मदद करो:
1. चेक-इन तारीख (DD-MM-YYYY)
2. चेक-आउट तारीख (DD-MM-YYYY)
3. मेहमानों की संख्या (1-4)
4. कमरे का प्रकार (6 घंटे या 24 घंटे)
5. स्थान/एरिया

**महत्वपूर्ण:**
- प्राकृतिक तरीके से बातचीत करो लेकिन जानकारी एकत्र करते रहो
- हिंदी/हिंग्लिश में जवाब दो
- जब सभी डेटा मिल जाए तो किराया प्रदान करो
- तारीखें DD-MM-YYYY में पूछो

**वर्तमान बुकिंग डेटा:**
${JSON.stringify(userContext.bookingData || {}, null, 2)}

उपयोगकर्ता को प्राकृतिक तरीके से अगली जानकारी के लिए पूछो।`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];

    // Add conversation history
    if (userContext.conversation && userContext.conversation.length > 0) {
      userContext.conversation.slice(-4).forEach(msg => {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: userMessage
    });

    return messages;
  }

  /**
   * Extract booking data from conversation
   */
  extractBookingData(userMessage, aiResponse, userContext) {
    const data = {};
    const text = (userMessage + ' ' + aiResponse).toLowerCase();

    // Check for dates (DD-MM-YYYY pattern)
    const datePattern = /(\d{1,2})-(\d{1,2})-(\d{4})/g;
    const dates = text.match(datePattern) || [];
    
    if (dates.length > 0 && !userContext.bookingData?.checkinDate) {
      data.checkinDate = dates[0];
    }
    if (dates.length > 1 && !userContext.bookingData?.checkoutDate) {
      data.checkoutDate = dates[1];
    }

    // Check for guest count (1-4)
    if (/(?:एक|1)(?:\s+मेहमान)?/i.test(text) && !userContext.bookingData?.guestCount) {
      data.guestCount = 1;
    } else if (/(?:दो|2)(?:\s+मेहमान)?/i.test(text) && !userContext.bookingData?.guestCount) {
      data.guestCount = 2;
    } else if (/(?:तीन|3)(?:\s+मेहमान)?/i.test(text) && !userContext.bookingData?.guestCount) {
      data.guestCount = 3;
    } else if (/(?:चार|4)(?:\s+मेहमान)?/i.test(text) && !userContext.bookingData?.guestCount) {
      data.guestCount = 4;
    }

    // Check for room type
    if (/(?:24|चौबीस)\s*घंट/i.test(text) && !userContext.bookingData?.roomType) {
      data.roomType = '24_hours';
    } else if (/(?:6|छह)\s*घंट/i.test(text) && !userContext.bookingData?.roomType) {
      data.roomType = '6_hours';
    }

    // Check for location
    if (/(?:दिल्ली|delhi|कश्मीर|kashmere|जयपुर|jaipur)/i.test(text) && !userContext.bookingData?.location) {
      const match = text.match(/(?:दिल्ली|delhi|कश्मीर|kashmere|जयपुर|jaipur)/i);
      data.location = match[0];
    }

    return data;
  }

  /**
   * Check if booking is complete
   */
  isBookingComplete(bookingData) {
    return !!(
      bookingData.checkinDate &&
      bookingData.checkoutDate &&
      bookingData.guestCount &&
      bookingData.roomType &&
      bookingData.location
    );
  }

  /**
   * Generate booking confirmation
   */
  generateConfirmation(bookingData) {
    return `✅ आपकी बुकिंग की पुष्टि हुई!

📅 चेक-इन: ${bookingData.checkinDate}
📅 चेक-आउट: ${bookingData.checkoutDate}
👥 मेहमान: ${bookingData.guestCount}
🛏️ कमरा: ${bookingData.roomType === '24_hours' ? '24 घंटे' : '6 घंटे'}
📍 स्थान: ${bookingData.location}
💰 कीमत: ₹${bookingData.price || 'TBD'}

कृपया पेमेंट विवरण साझा करें।`;
  }
}

export default new GroqService();
