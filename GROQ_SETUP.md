# AI Chat Setup with Groq

## Quick Start

### 1. Get Your Free Groq API Key

1. Go to: https://console.groq.com/keys
2. Sign up (free account)
3. Create an API key
4. Copy the key

### 2. Add to .env

```env
GROQ_API_KEY=your_key_here
```

### 3. Done! 🚀

The bot will now use AI for natural conversations while collecting booking data.

---

## How It Works

### WITHOUT Groq API Key
- Uses original state-based flow
- Users go through: START → CHECKIN → CHECKOUT → GUEST_COUNT → etc.
- Structured but rigid

### WITH Groq API Key
- Natural language AI chat in START state
- User can just say: "I need a hotel room for 2 people from 25-12 to 27-12 in Delhi"
- AI extracts data automatically
- Auto-transitions when all data collected
- Feels like talking to a real person

---

## Example Conversation (with AI)

```
User: Hi! I need a room for tomorrow
Bot: नमस्ते! आपको कितने दिन के लिए कमरा चाहिए? और कितने लोग ठहरेंगे?

User: 2 days, me and my girlfriend
Bot: बहुत अच्छा! 2 मेहमानों के लिए कमरा तय है। कृपया आगमन की तारीख बताएं (DD-MM-YYYY में):

User: 25-12-2025
Bot: धन्यवाद! तो चेक-आउट 27-12-2025 को होगा? और कमरा 24 घंटे या 6 घंटे का चाहिए?

User: Full day, and in Delhi
Bot: ✅ आपकी बुकिंग की पुष्टि...
💰 कुल: ₹5,000
```

---

## Fallback

If `GROQ_API_KEY` is not set:
- ✅ Bot still works
- ✅ Uses classic state-based booking flow
- ⚠️ No AI chat (but fully functional)

---

## Groq Models Available

- **mixtral-8x7b-32768** ⭐ (Recommended)
  - Fast, powerful, free
  - Good for Hindi/Hinglish
  - 32k context window

- **llama2-70b-4096**
  - Larger, slower
  - More accurate extraction

- **gemma-7b-it**
  - Smaller, faster
  - Budget option

---

## Pricing

**Groq Free Tier:**
- ✅ No credit card needed
- ✅ Unlimited API calls (rate-limited)
- ✅ Perfect for testing & development

**Production:**
- ~$0.0005 per 1000 input tokens
- ~$0.001 per 1000 output tokens
- Very cheap for WhatsApp scale

---

## Troubleshooting

### AI not responding
1. Check if GROQ_API_KEY is in .env
2. Verify key is valid at https://console.groq.com
3. Check logs: `npm start` and watch console

### Key limit exceeded
- Upgrade at https://console.groq.com/limits
- Or use classic flow (remove key)

### Wrong data extraction
- Update prompt in `groqService.js` line 50
- Add more examples for Hindi/Hinglish

---

## Disabling AI Chat

Just remove or comment out the `GROQ_API_KEY` in .env:

```env
# GROQ_API_KEY=gsk_...
```

Bot will automatically fallback to state-based flow.

---

## Next Steps

1. ✅ Add your Groq API key to .env
2. ✅ Push to git
3. ✅ Render will auto-deploy
4. ✅ Test with new user!

Enjoy natural conversations! 🎉
