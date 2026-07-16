import 'server-only';

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

// salt:hash(둘 다 hex) 형식으로 User.passwordHash 한 칸에 저장한다.
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

// 타이밍 공격 방지를 위해 timingSafeEqual로 비교한다.
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;

  const derived = (await scrypt(plain, salt, KEY_LENGTH)) as Buffer;
  const storedBuf = Buffer.from(hashHex, 'hex');
  if (storedBuf.length !== derived.length) return false;

  return timingSafeEqual(derived, storedBuf);
}
