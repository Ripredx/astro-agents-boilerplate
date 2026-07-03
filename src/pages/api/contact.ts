import type { APIRoute } from 'astro';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Sadece Vercel KV environment var ise ratelimit oluştur
const ratelimit = process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  ? new Ratelimit({
      redis: kv,
      limiter: Ratelimit.slidingWindow(5, '1 h'), // IP bazlı saatlik 5 istek
    })
  : null;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    // Rate Limiting
    if (ratelimit) {
      const identifier = clientAddress || 'anonymous';
      const { success } = await ratelimit.limit(identifier);
      if (!success) {
        return new Response(JSON.stringify({ message: 'Too many requests' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const data = await request.formData();
    const name = data.get('name');
    const email = data.get('email');
    const honeypot = data.get('website'); // Honeypot field

    // Honeypot check (Silent fail)
    if (honeypot) {
      return new Response(JSON.stringify({ message: 'Success' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Normal processing logic...
    console.log(`Received contact from: ${name} (${email})`);

    return new Response(JSON.stringify({ message: 'Success' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    // API endpoint'lerinde asla hassas hata detayını client'a döndürme
    console.error('Contact API Error:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
