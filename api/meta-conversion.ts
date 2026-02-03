import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Hash function for PII
const hashValue = (value: string): string => {
  return crypto
    .createHash('sha256')
    .update(value.toLowerCase().trim())
    .digest('hex');
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { eventName, name, email, phone, userAgent, sourceUrl, test_event_code } = req.body;

    // Validate required fields
    if (!eventName || !sourceUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Base user data (always include)
    const userData: any = {
      client_user_agent: userAgent,
      country: [hashValue('au')]
    };

    // Add additional data only for Contact events
    if (eventName === 'Contact' && name && email && phone) {
      const firstName = name.split(' ')[0];
      userData.em = [hashValue(email)];
      userData.ph = [hashValue(phone.replace(/[\s\-\(\)]/g, ''))];
      userData.fn = [hashValue(firstName)];
    }

    // Build CAPI payload
    const payload: any = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: sourceUrl,
          user_data: userData,
          custom_data: {
            content_name: eventName === 'Lead' 
              ? 'Phone Call Button Click' 
              : 'Contact Form Submission'
          }
        }
      ],
      access_token: process.env.META_CAPI_ACCESS_TOKEN
    };
    
    if (test_event_code) {
        payload.test_event_code = test_event_code;
    }

    // Send to Meta CAPI
    const metaResponse = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.META_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error('Meta CAPI Error:', result);
      return res.status(500).json({ 
        error: 'Failed to send to Meta', 
        details: result 
      });
    }

    return res.status(200).json({ success: true, result });
    
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}