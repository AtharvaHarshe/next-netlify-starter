// netlify/functions/capture.js
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL || 'no-reply@yourdomain.com';

async function sendEmail(subject, text) {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: TO_EMAIL }] }],
      from: { email: FROM_EMAIL },
      subject,
      content: [{ type: 'text/plain', value: text }]
    })
  });
  if (!res.ok) throw new Error(`SendGrid HTTP ${res.status}`);
}

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    console.log('Location update:', data);
    const {
      name = '', mobile = '', email = '',
      latitude, longitude, accuracy, speed, heading, timestamp,
      locationError
    } = data;

    const subject = 'New location submission';
    const text = [
      `Name: ${name}`,
      `Mobile: ${mobile}`,
      `Email: ${email}`,
      latitude !== undefined ? `Latitude: ${latitude}` : '',
      longitude !== undefined ? `Longitude: ${longitude}` : '',
      accuracy !== undefined ? `Accuracy (m): ${accuracy}` : '',
      speed !== undefined ? `Speed: ${speed}` : '',
      heading !== undefined ? `Heading: ${heading}` : '',
      timestamp ? `Timestamp: ${new Date(timestamp).toISOString()}` : '',
      locationError ? `Location error: ${locationError}` : ''
    ].filter(Boolean).join('\n');

    if (SENDGRID_API_KEY && TO_EMAIL) {
      await sendEmail(subject, text);
    } else {
      console.log('Email not sent: missing SENDGRID_API_KEY or TO_EMAIL');
    }

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error(e);
    return { statusCode: 400, body: 'Bad Request' };
  }
}
