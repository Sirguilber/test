import { deleteCookie, parseCookies } from '../_utils/cookies.js';
import { deleteSession } from '../_utils/sessions.js';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const cookies = parseCookies(request.headers.get('cookie'));
  const sessionToken = cookies.session;

  if (sessionToken) {
    deleteSession(sessionToken);
  }

  const cookie = deleteCookie('session', { path: '/', secure: true, sameSite: 'lax' });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
}