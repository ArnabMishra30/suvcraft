const SECRET = process.env.JWT_SECRET || 'change-me';
const enc = new TextEncoder();

function b64urlFromBytes(bytes) {
  let str = '';
  for (let i = 0; i < bytes.length; i++) str += String.fromCharCode(bytes[i]);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlFromString(s) {
  return b64urlFromBytes(enc.encode(s));
}

function b64urlDecodeToString(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return atob(s);
}

let keyPromise;
function getKey() {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey(
      'raw',
      enc.encode(SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );
  }
  return keyPromise;
}

async function sign(input) {
  const key = await getKey();
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(input));
  return b64urlFromBytes(new Uint8Array(sig));
}

export async function signJwt(payload, expiresInSec = 60 * 60 * 24 * 30) {
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const head = b64urlFromString(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const data = b64urlFromString(JSON.stringify(body));
  const signature = await sign(`${head}.${data}`);
  return `${head}.${data}.${signature}`;
}

export async function verifyJwt(token) {
  if (!token) return null;
  const [h, p, s] = token.split('.');
  if (!h || !p || !s) return null;
  const expected = await sign(`${h}.${p}`);
  if (expected !== s) return null;
  try {
    const payload = JSON.parse(b64urlDecodeToString(p));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}