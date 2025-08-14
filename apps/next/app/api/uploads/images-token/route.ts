import { NextResponse } from 'next/server';
import logger from '../../../../lib/logger';

// POST /api/uploads/images-token
// Generates a short-lived Direct Creator Upload token for Cloudflare Images
export async function POST() {
  logger.info({ route: 'images-token' }, 'request:start');
  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;

  if (!(accountId && apiToken)) {
    logger.error('Missing CF_ACCOUNT_ID or CF_API_TOKEN env vars');
    return NextResponse.json(
      { error: 'Missing CF_ACCOUNT_ID or CF_API_TOKEN env vars' },
      { status: 500 }
    );
  }

  try {
    const resp = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v2/direct_upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      }
    );

    const data = await resp.json();
    if (!resp.ok) {
      logger.error({ status: resp.status, data }, 'cloudflare images api error');
      return NextResponse.json(
        { error: 'Cloudflare Images API error', details: data },
        { status: 502 }
      );
    }

    // Cloudflare returns { success, result: { id, uploadURL, ... }, ... }
    logger.info({ route: 'images-token' }, 'request:success');
    return NextResponse.json(data);
  } catch (err: unknown) {
    logger.error({ err: String(err) }, 'cloudflare images token request failed');
    return NextResponse.json(
      {
        error: 'Failed to request Cloudflare Images token',
        details: String(err),
      },
      { status: 500 }
    );
  }
}
