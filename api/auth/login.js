import { createCookie } from '../_utils/cookies.js';
import { createSession, timingSafeEqual } from '../_utils/sessions.js';

function getValidCredentials() {
  const creds = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('AUTH_USER_')) {
      const email = key.replace('AUTH_USER_', '').toLowerCase().replace(/_/g, '.');
      creds[email] = value;
    }
  }
  return Object.keys(creds).length > 0 ? creds : { 'admin@example.com': 'changeme' };
}

const VALID_CREDENTIALS = getValidCredentials();

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const contentType = request.headers.get('content-type') || '';
  let email, password;

  if (contentType.includes('application/json')) {
    const body = await request.json();
    email = body.email?.trim().toLowerCase();
    password = body.password;
  } else if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    email = formData.get('email')?.trim().toLowerCase();
    password = formData.get('password');
  } else {
    return new Response(JSON.stringify({ error: 'Invalid content type' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!email || !password) {
    return new Response(JSON.stringify({ error: 'Email and password required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const expectedPassword = VALID_CREDENTIALS[email];
  if (!expectedPassword || !timingSafeEqual(password, expectedPassword)) {
    await new Promise(r => setTimeout(r, 100));
    return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const sessionToken = createSession(email);

  const cookie = createCookie('session', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/'
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
}