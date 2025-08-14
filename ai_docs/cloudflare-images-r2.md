# Cloudflare Images + R2 Guide

Project-wide guide for storing, transforming, and delivering images (and large/original files) using Cloudflare Images and R2.

---

## What to use when

- Images (Paid plan for storage):
  - Avatars, thumbnails, gallery/display images.
  - Need variants (resize/fit), CDN caching, optional signed delivery.
- R2 (S3-compatible object storage):
  - Original photos, large files, audio (journaling), any asset > 10 MB, or needing multipart uploads.
  - Serve via Cloudflare CDN and/or Images Transformations if needed.

---

## Key limits and formats (Images)

- Max dimension: 12,000 px; Max area: 100 MP; File size limit: 10 MB.
- Animations total: 50 MP (GIF/WebP). SVG sanitized; not resized.
- HEIC ingest OK; must serve as AVIF/WebP/JPEG/PNG.
- AVIF best-effort; may fall back to WebP/JPEG.

References: overview, upload limits, transform formats, SVG sanitization.

---

## Variants and delivery (Images)

- Up to 100 named variants (e.g., `avatar`, `thumb`, `gallery`).
- Flexible variants can be enabled globally, but cannot be combined with signed delivery URLs.
- Signed URLs: use for private delivery. Public variants can be allowed even when images require signing.
- Browser TTL defaults to ~2 days; set per-account or per-variant (`browser_ttl`). Private images ignore Browser TTL and cache based on token expiry.

---

## Environment variables

Add to `.env.example` and safe loader:

- CF_ACCOUNT_ID
- CF_API_TOKEN (Images API)
- CF_IMAGES_ACCOUNT_HASH (for `https://imagedelivery.net/<hash>/...`)
- R2_BUCKET
- R2_ACCESS_KEY_ID
- R2_SECRET_ACCESS_KEY
- (If using Workers, prefer bindings over static creds)

---

## Server endpoints (Next.js)

1) Direct Creator Upload (Images)

- Purpose: Allow clients to upload directly to Images using a one-time token.
- Endpoint: `POST /api/uploads/images-token`
- Returns: `{ uploadURL, id }` or the token object from Images API.
- Server work: Call Cloudflare Images API `accounts/{account_id}/images/v2/direct_upload` with Bearer `CF_API_TOKEN`.
- Client: `fetch(uploadURL, { method: 'POST', body: FormData(file) })`.

2) Presigned PUT (R2)

- Purpose: Client-upload originals/large files directly to R2.
- Endpoint: `POST /api/uploads/r2-presign`
- Request: `{ contentType, ext, size }`
- Returns: `{ url, headers, key, expiresAt }`
- Server work: Use AWS S3-compatible SDK to generate a short-lived presigned PUT for `R2_BUCKET` with validation on size/type and a namespaced key.

On success, persist `{ imageId | imagesPublicId, r2Key, variants[] }` in InstantDB as needed.

---

## Client flows

Web (Next.js):

- Compress before upload (canvas) to meet 10 MB Images limit.
- For Images: request token, POST file via `uploadURL`.
- For R2: use presigned PUT URL; include required headers; handle retries.
- Store returned IDs/keys in InstantDB; render via Image Delivery URLs.

Expo (Mobile):

- Use `expo-image-manipulator` to resize/compress.
- Same flows as Web, using `fetch` to upload.
- Implement offline queue with backoff; resume on connectivity.

---

## Rendering

- Images stored in Images: `https://imagedelivery.net/<CF_IMAGES_ACCOUNT_HASH>/<image_id>/<variant>`
- Private: use signed URL scheme with token and expiry.
- R2 originals: serve through Cloudflare (optionally enable Image Transformations on zone or use Workers Images API for on-the-fly).

---

## Security & privacy

- Never ship permanent credentials to clients.
- Use short-lived tokens (Images) and presigned URLs (R2); restrict by content-type, size, and key prefix.
- Validate server-side: MIME, file size, owner, and sanitize keys.
- Prefer private originals in R2; expose only transformed/public variants.

---

## Webhooks (optional)

- For direct creator uploads, configure Images webhooks for success/failure notifications.
- Use to finalize DB records or trigger post-processing (e.g., generate additional variants, moderation).

---

## Pricing notes (high level)

- Free plan: 5,000 unique transformations/month for remote images.
- Paid plan (for Images storage/delivery): metrics include Images Stored and Images Delivered.
- For R2 usage, refer to R2 pricing; zero egress to Cloudflare products.

---

## Checklist per slice

- Slice 04 (Photo & Avatar)
  - Direct upload tokens (Images) for UI assets; R2 for originals.
  - Define variants (`avatar`, `thumb`, `gallery`); set `browser_ttl`.
  - Use signed URLs for private assets; avoid flexible variants when signing.

- Slice 06 (Journaling)
  - Audio → R2 multipart + presigned PUT; short-lived GET for playback if private.

- Slice 05/07 (optional visuals)
  - If exporting snapshots, use signed URLs and appropriate TTLs.

---

## Minimal examples

Direct upload token (server outline):

```ts
// POST /api/uploads/images-token
// 1) POST to CF Images direct upload endpoint with Bearer CF_API_TOKEN
// 2) Return `uploadURL` (and any ID) to client
```

R2 presigned PUT (server outline):

```ts
// POST /api/uploads/r2-presign
// 1) Validate type/size
// 2) Generate s3Client.getSignedUrl(PutObjectCommand, { Bucket, Key, ContentType, Expires })
// 3) Return { url, headers, key, expiresAt }
```

Client upload outline:

```ts
// Images
// const res = await fetch(uploadURL, { method: 'POST', body: formData });
// const { id } = await res.json();

// R2
// await fetch(url, { method: 'PUT', headers, body: fileBlob });
```

---

## References

- Overview & Features: Cloudflare Images (Storage, Direct Upload, Variants, Signed URLs)
- Upload limits and formats; Transformations and SVG sanitization
- Create variants; Browser TTL; Serve private images
- Demos & architectures: Images + R2 patterns
- Tutorials & examples: Transform before uploading to R2, watermarking from KV

