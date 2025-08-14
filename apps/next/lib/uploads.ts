export type DirectUploadTokenResponse = {
  success: boolean;
  result?: {
    id: string;
    uploadURL: string;
  };
  errors?: unknown[];
};

export async function getImagesDirectUpload(): Promise<{
  id: string;
  uploadURL: string;
}> {
  const res = await fetch('/api/uploads/images-token', { method: 'POST' });
  if (!res.ok)
    throw new Error('Failed to get Cloudflare Images direct upload token');
  const data: DirectUploadTokenResponse = await res.json();
  if (!(data.success && data.result?.uploadURL && data.result?.id)) {
    throw new Error('Invalid response from Images token endpoint');
  }
  return { id: data.result.id, uploadURL: data.result.uploadURL };
}

export async function uploadToCloudflareImages(
  file: File
): Promise<{ id: string; response: any }> {
  const { id, uploadURL } = await getImagesDirectUpload();
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch(uploadURL, { method: 'POST', body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error('Cloudflare Images upload failed');
  return { id, response: json };
}

export async function getR2PresignedPut(params: {
  contentType: string;
  ext?: string;
  size?: number;
}) {
  const res = await fetch('/api/uploads/r2-presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to get R2 presigned URL');
  return (await res.json()) as {
    url: string;
    headers: Record<string, string>;
    key: string;
    expiresAt: string;
  };
}

export async function uploadToR2(
  file: File | Blob,
  params: { contentType: string; ext?: string }
): Promise<{ key: string }> {
  const presign = await getR2PresignedPut({
    contentType: params.contentType,
    ext: params.ext,
    size: 'size' in file ? (file as File).size : undefined,
  });
  const put = await fetch(presign.url, {
    method: 'PUT',
    headers: { ...presign.headers },
    body: file,
  });
  if (!put.ok) throw new Error('R2 upload failed');
  return { key: presign.key };
}
