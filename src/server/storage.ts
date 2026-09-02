import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORAGE_DIR = path.join(process.cwd(), '.certificates_storage');
const SECRET = process.env.N8N_WEBHOOK_SECRET || process.env.STORAGE_SECRET || 'certificate_secure_secret_2026';
const DEFAULT_EXPIRATION_SECONDS = 3600; // 1 hour

// Ensure private storage directory exists
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export interface StoredCertificateFile {
  fileKey: string;
  fileName: string;
  size: number;
  mimeType: string;
  downloadUrl: string;
  expiresAt: number;
}

/**
 * Generates an HMAC-SHA256 signed temporary token for a file
 */
export function generateSignedToken(fileKey: string, fileName: string, expirationSeconds: number = DEFAULT_EXPIRATION_SECONDS): string {
  const expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;
  const payload = `${fileKey}:${fileName}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');
  const tokenData = JSON.stringify({ fileKey, fileName, expiresAt, signature });
  return Buffer.from(tokenData).toString('base64url');
}

/**
 * Verifies an HMAC-SHA256 signed temporary token
 */
export function verifySignedToken(token: string): { valid: boolean; fileKey?: string; fileName?: string; error?: string } {
  try {
    const raw = Buffer.from(token, 'base64url').toString('utf-8');
    const parsed = JSON.parse(raw);
    const { fileKey, fileName, expiresAt, signature } = parsed;

    if (!fileKey || !fileName || !expiresAt || !signature) {
      return { valid: false, error: 'Malformed token' };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > expiresAt) {
      return { valid: false, error: 'Download link has expired' };
    }

    const payload = `${fileKey}:${fileName}:${expiresAt}`;
    const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex');

    if (crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSig, 'hex'))) {
      return { valid: true, fileKey, fileName };
    }

    return { valid: false, error: 'Invalid token signature' };
  } catch (err: any) {
    return { valid: false, error: 'Failed to verify token' };
  }
}

/**
 * Saves a certificate buffer to private storage and returns metadata with a signed temporary URL
 */
export async function saveCertificateFile(
  buffer: Buffer,
  originalFileName: string,
  appBaseUrl?: string
): Promise<StoredCertificateFile> {
  ensureStorageDir();

  const cleanFileName = path.basename(originalFileName);
  const fileKey = `${crypto.randomUUID()}_${cleanFileName}`;
  const filePath = path.join(STORAGE_DIR, fileKey);

  await fs.promises.writeFile(filePath, buffer);

  const baseUrl = appBaseUrl || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const token = generateSignedToken(fileKey, cleanFileName);
  const downloadUrl = `${baseUrl.replace(/\/$/, '')}/api/certificates/download/${token}`;
  const expiresAt = Math.floor(Date.now() / 1000) + DEFAULT_EXPIRATION_SECONDS;

  return {
    fileKey,
    fileName: cleanFileName,
    size: buffer.length,
    mimeType: 'application/pdf',
    downloadUrl,
    expiresAt,
  };
}

/**
 * Retrieves a certificate file from private storage
 */
export async function getCertificateFile(fileKey: string): Promise<{ buffer: Buffer; filePath: string } | null> {
  ensureStorageDir();
  const cleanKey = path.basename(fileKey);
  const filePath = path.join(STORAGE_DIR, cleanKey);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = await fs.promises.readFile(filePath);
  return { buffer, filePath };
}

/**
 * Deletes a certificate file from storage
 */
export async function deleteCertificateFile(fileKey: string): Promise<boolean> {
  try {
    const cleanKey = path.basename(fileKey);
    const filePath = path.join(STORAGE_DIR, cleanKey);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
      return true;
    }
    return false;
  } catch (err) {
    return false;
  }
}

/**
 * Cleans up files older than maxAgeMs in the storage directory
 */
export async function cleanupExpiredFiles(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<number> {
  try {
    ensureStorageDir();
    const files = await fs.promises.readdir(STORAGE_DIR);
    const now = Date.now();
    let cleaned = 0;

    for (const file of files) {
      const filePath = path.join(STORAGE_DIR, file);
      const stat = await fs.promises.stat(filePath);
      if (now - stat.mtimeMs > maxAgeMs) {
        await fs.promises.unlink(filePath);
        cleaned++;
      }
    }
    return cleaned;
  } catch {
    return 0;
  }
}
