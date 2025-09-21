// netlify/functions/capture.js
// Sends an email to a fixed recipient using SendGrid's API.
// Set SENDGRID_API_KEY in Netlify environment variables.

const TO_EMAIL = 'atharvaharshe12345@gmail.com';
const FROM_EMAIL = 'no-reply@yourdomain.com'; // Or a verified sender in SendGrid

async function sendEmail(subject, text) {
  const key = process.env.SENDGRID_API_KEY;
  if (!key) throw new Error('Missing SENDGRID_API_KEY env var');

  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: TO_EMAIL }] }],
      from: { email: FROM_EMAIL },
      subject,
      content: [{ type: 'text/plain', value: text }]
    })
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`SendGrid HTTP ${res.status}: ${body}`);
  }
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

    const subject = 'New submission with location';
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
      locationError ? `Location error: ${locationError}` : '',
      latitude !== undefined && longitude !== undefined
        ? `Map: https://maps.google.com/?q=${latitude},${longitude}`
        : ''
    ].filter(Boolean).join('\n');

    await sendEmail(subject, text);

    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error(e);
    return { statusCode: 400, body: 'Bad Request' };
  }
}
