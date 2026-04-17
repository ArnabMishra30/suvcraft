import bcrypt from 'bcryptjs';

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain, hash) {
  if (!plain || !hash) return false;
  const normalized = hash.startsWith('$2y$') ? '$2a$' + hash.slice(4) : hash;
  return bcrypt.compare(plain, normalized);
}