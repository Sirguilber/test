const sessions = new Map();

export function createSession(email) {
  const token = generateToken();
  sessions.set(token, { email, created: Date.now() });
  return token;
}

export function getSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (Date.now() - session.created > 7 * 24 * 60 * 60 * 1000) {
    sessions.delete(token);
    return null;
  }
  return session;
}

export function deleteSession(token) {
  sessions.delete(token);
}

function generateToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}