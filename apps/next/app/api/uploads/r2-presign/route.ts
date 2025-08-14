import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { type NextRequest, NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

// POST /api/uploads/r2-presign
// Body: { contentType: string, ext?: string, size?: number }
// Returns: { url, headers, key, expiresAt }
export async function POST(req: NextRequest) {
  logger.info({ route: 'r2-presign' }, 'request:start');
  const R2_BUCKET = process.env.R2_BUCKET;
  const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
  const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
  const R2_ENDPOINT = process.env.R2_ENDPOINT;

  if (!(R2_BUCKET && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_ENDPOINT)) {
    logger.error('Missing R2 env vars');
    return NextResponse.json(
      {
        error:
          'Missing R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_ENDPOINT',
      },
      { status: 500 }
    );
  }

  const { contentType, ext, size } = await req.json().catch(() => ({}));
  if (!contentType) {
    logger.error('contentType is required');
    return NextResponse.json(
      { error: 'contentType is required' },
      { status: 400 }
    );
  }

  // Simple validation example: limit to <= 200MB, adjust per needs
  if (size && size > 200 * 1024 * 1024) {
    logger.error({ size }, 'file too large');
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Namespace key by date/user (add auth later)
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  const uid = crypto.randomUUID();
  const safeExt = (ext || '').replace(/[^a-zA-Z0-9.-]/g, '').slice(0, 12);
  const key = `uploads/${y}/${m}/${d}/${uid}${safeExt ? `.${safeExt}` : ''}`;

  const s3 = new S3Client({
    region: 'auto',
    endpoint: R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });

  const putCmd = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  // Short-lived presign (e.g., 5 min)
  const expiresIn = 60 * 5;
  const url = await getSignedUrl(s3, putCmd, { expiresIn });
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  logger.info({ route: 'r2-presign', key }, 'request:success');
  return NextResponse.json({
    url,
    headers: { 'Content-Type': contentType },
    key,
    expiresAt,
  });
}
