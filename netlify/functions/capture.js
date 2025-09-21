// netlify/functions/capture.js
import { getStore } from '@netlify/blobs';

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    const store = getStore('submissions'); // a named namespace
    const key = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await store.setJSON(key, data); // persist the JSON payload
    return { statusCode: 200, body: 'ok' };
  } catch (e) {
    console.error(e);
    return { statusCode: 400, body: 'Bad Request' };
  }
}
