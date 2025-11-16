import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

// Ensure encryption key is 32 bytes
const key = Buffer.from(ENCRYPTION_KEY.slice(0, 64), 'hex');

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Return iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Encrypt an object's sensitive fields
export function encryptObject(obj: any, sensitiveFields: string[]): any {
  const result = { ...obj };

  for (const field of sensitiveFields) {
    if (result[field]) {
      result[field] = encrypt(result[field]);
    }
  }

  return result;
}

// Decrypt an object's sensitive fields
export function decryptObject(obj: any, sensitiveFields: string[]): any {
  const result = { ...obj };

  for (const field of sensitiveFields) {
    if (result[field]) {
      try {
        result[field] = decrypt(result[field]);
      } catch (error) {
        // If decryption fails, assume it's already decrypted or corrupted
        console.error(`Failed to decrypt field ${field}:`, error);
      }
    }
  }

  return result;
}
