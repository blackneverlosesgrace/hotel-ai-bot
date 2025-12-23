// WhatsApp API Service - Send messages and handle API calls

import axios from 'axios';

const API_VERSION = 'v18.0';
const BASE_URL = `https://graph.instagram.com/${API_VERSION}`;

export class WhatsAppService {
  constructor(phoneNumberId, accessToken) {
    this.phoneNumberId = phoneNumberId;
    this.accessToken = accessToken;
  }

  // Send text message
  async sendTextMessage(recipientPhoneNumber, text) {
    try {
      const response = await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhoneNumber,
          type: 'text',
          text: {
            body: text
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending text message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Send image message (e.g., QR code)
  async sendImageMessage(recipientPhoneNumber, imageUrl, caption = null) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhoneNumber,
        type: 'image',
        image: {
          link: imageUrl
        }
      };

      // Add caption if provided
      if (caption) {
        payload.image.caption = caption;
      }

      const response = await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending image message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Send interactive button message (for multiple choice)
  async sendButtonMessage(recipientPhoneNumber, headerText, bodyText, buttons) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhoneNumber,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: {
            type: 'text',
            text: headerText
          },
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map((btn, index) => ({
              type: 'reply',
              reply: {
                id: btn.id || String(index + 1),
                title: btn.title
              }
            }))
          }
        }
      };

      const response = await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending button message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Send message with template
  async sendTemplateMessage(recipientPhoneNumber, templateName, params = []) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        to: recipientPhoneNumber,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: 'en_US'
          }
        }
      };

      if (params.length > 0) {
        payload.template.parameters = {
          body: {
            parameters: params.map(p => ({ text: p }))
          }
        };
      }

      const response = await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending template message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Mark message as read
  async markMessageAsRead(messageId) {
    try {
      await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return { success: true };
    } catch (error) {
      console.error('Error marking message as read:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Send location message
  async sendLocationMessage(recipientPhoneNumber, latitude, longitude, locationName = null) {
    try {
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhoneNumber,
        type: 'location',
        location: {
          latitude,
          longitude,
          name: locationName || 'Hotel Location'
        }
      };

      const response = await axios.post(
        `${BASE_URL}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        messageId: response.data.messages[0].id,
        data: response.data
      };
    } catch (error) {
      console.error('Error sending location message:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message
      };
    }
  }

  // Verify webhook signature
  static verifyWebhookSignature(req, appSecret) {
    const signature = req.get('x-hub-signature-256');
    const body = req.rawBody || JSON.stringify(req.body);

    if (!signature) return false;

    const hash = require('crypto')
      .createHmac('sha256', appSecret)
      .update(body)
      .digest('base64');

    const expected = `sha256=${hash}`;
    return signature === expected;
  }
}

export default WhatsAppService;
