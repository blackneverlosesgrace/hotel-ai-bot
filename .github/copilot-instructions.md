# WhatsApp Hotel Booking Bot - Copilot Instructions

## Project Overview

This is a production-ready WhatsApp AI hotel booking chatbot built with Node.js and Express. It uses Meta's WhatsApp Cloud API to handle hotel booking conversations with automatic state management, payment processing, and hotel team notifications.

## Key Capabilities

- State-based conversation management
- Text and image message handling
- Online (QR) and hotel payment flows
- Automatic reminder system
- User data persistence
- Admin monitoring endpoints
- Hindi/Hinglish responses

## Development Guidelines

### Code Style
- Use ES6+ modules (import/export)
- Follow consistent naming conventions
- Add comments for complex logic
- Keep functions focused and small

### File Organization
- Keep service files focused on single responsibility
- Store configurations in config.js
- Use utils.js for shared functions
- Keep message templates in states.js

### Error Handling
- Always validate user input
- Provide graceful error messages
- Log errors for debugging
- Never expose sensitive data in errors

### Testing
- Test state transitions manually
- Verify message flows
- Test edge cases (invalid inputs)
- Check reminder triggers
- See TESTING.md for detailed scenarios

## Important Files

### Core Files (Don't Break These!)
- server.js - Main Express app with webhooks
- messageHandler.js - Conversation logic
- userStorage.js - User data management
- whatsappService.js - WhatsApp API integration

### Configuration Files
- config.js - Settings and environment setup
- .env - Secret credentials (never commit)
- states.js - Conversation states and pricing

### Supporting Files
- utils.js - Utility functions and messages
- reminderService.js - Automatic reminders

## Common Tasks

### Adding New Conversation States
1. Add state to STATES in states.js
2. Add state flow in STATE_FLOW
3. Add message template in utils.js
4. Add handling logic in messageHandler.js

### Changing Pricing
1. Update PRICING in states.js
2. Adjust room types if needed
3. Update HOTEL_ROOMS if adding rooms

### Modifying Messages
1. Update MESSAGES object in utils.js
2. Keep Hindi/Hinglish tone
3. Test message output

### Adding New Endpoints
1. Add route in server.js
2. Document in API.md
3. Add test example

## Deployment

### Local Development
```bash
npm run dev  # Uses node --watch for auto-reload
```

### Production
```bash
npm start    # Standard npm start
```

### Environment Setup
1. Copy .env.example to .env
2. Fill in WhatsApp credentials
3. Verify webhook token

## Monitoring & Debugging

### Check Bot Status
```bash
curl http://localhost:3000/status
```

### View User Details
```bash
curl http://localhost:3000/users/919876543210
```

### Test Message Flow
```bash
curl -X POST http://localhost:3000/send-test-flow \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

## Documentation

- **README.md** - Project overview and features
- **QUICKSTART.md** - Setup and initial testing
- **API.md** - Detailed API endpoint documentation
- **TESTING.md** - Complete testing scenarios
- **DEPLOYMENT.md** - Production deployment guide
- **IMPLEMENTATION.md** - Project structure and technical details

## Best Practices

1. Always validate dates in DD-MM-YYYY format
2. Parse user input case-insensitively
3. Keep messages short and clear
4. Use numbered options for choices
5. Update state after processing message
6. Store conversation history
7. Handle errors gracefully
8. Never commit .env file

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Real payment gateway (Razorpay)
- [ ] Hotel inventory API connection
- [ ] Admin dashboard for hotel team
- [ ] Multi-language support
- [ ] NLP for better input parsing
- [ ] Analytics and reporting
- [ ] Webhook request verification

## API Response Format

All JSON responses should follow this structure:
```json
{
  "success": true/false,
  "data": {},
  "error": "error message if any",
  "timestamp": "ISO timestamp"
}
```

## Webhook Requirements

- Must respond within 10 seconds
- Always return 200 OK for incoming messages
- Process messages asynchronously
- Subscribe to: messages, message_status

## Security Notes

- Never hardcode credentials
- Always use environment variables
- Validate all user inputs
- Sanitize error messages
- Use HTTPS in production
- Verify webhook signatures
- Rotate API tokens regularly

## For Questions or Issues

1. Check the documentation files
2. Review error logs
3. Test with TESTING.md scenarios
4. Check WhatsApp API docs
5. Verify configuration in .env

## Project Repository

When making changes:
1. Keep .env.example updated
2. Update documentation
3. Add comments for complex logic
4. Test thoroughly before deploying
5. Use meaningful commit messages

---

Last Updated: December 2025
