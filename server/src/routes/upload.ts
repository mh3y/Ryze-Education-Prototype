/**
 * /api/upload — file upload via Cloudinary
 *
 * Returns a signed Cloudinary upload URL so the browser uploads directly to
 * Cloudinary (no large binary passes through our server).
 *
 * Flow:
 *   1. Browser → POST /api/upload/sign  (gets back { signature, timestamp, upload_url })
 *   2. Browser → POST upload_url with FormData  (Cloudinary direct upload)
 *   3. Cloudinary → secure_url returned to browser
 *   4. Browser stores secure_url in homework submission, resource, etc.
 */

import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../auth/middleware';

export const uploadRouter = Router();
uploadRouter.use(requireAuth);

const CLOUD_NAME   = process.env.CLOUDINARY_CLOUD_NAME  ?? '';
const API_KEY      = process.env.CLOUDINARY_API_KEY     ?? '';
const API_SECRET   = process.env.CLOUDINARY_API_SECRET  ?? '';
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET ?? 'ryze_uploads';

// ── POST /api/upload/sign ─────────────────────────────────────────────────────
// Returns a signed upload signature. The browser POSTs directly to Cloudinary.

uploadRouter.post('/sign', (req, res) => {
  if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
    res.status(501).json({ detail: 'Cloudinary not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.' });
    return;
  }

  const { folder } = req.body as { folder?: string };
  const timestamp  = Math.round(Date.now() / 1000);
  const params: Record<string, string | number> = {
    timestamp,
    upload_preset: UPLOAD_PRESET,
    folder: folder ?? 'ryze',
  };

  // Build the signature string — alphabetically sorted key=value pairs joined by &
  const toSign = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&') + API_SECRET;

  const signature = crypto.createHash('sha256').update(toSign).digest('hex');

  res.json({
    signature,
    timestamp,
    api_key:     API_KEY,
    cloud_name:  CLOUD_NAME,
    upload_url:  `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    upload_preset: UPLOAD_PRESET,
    folder:      folder ?? 'ryze',
  });
});

// ── POST /api/upload/url ──────────────────────────────────────────────────────
// Simpler endpoint: client provides a public URL, we store it as-is (no Cloudinary).
// Useful for Google Drive / YouTube / external links in resources.

uploadRouter.post('/url', (req, res) => {
  const { url, title, type } = req.body as { url?: string; title?: string; type?: string };
  if (!url) { res.status(400).json({ detail: 'url is required' }); return; }
  // Just echo back validated — the caller stores the URL themselves in the resource/submission
  res.json({ url, title: title ?? null, type: type ?? 'link' });
});
