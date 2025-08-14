'use client';

import React from 'react';
import { uploadToCloudflareImages } from '../../lib/uploads';

export default function ImagesDemoPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [result, setResult] = React.useState<any>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading to Cloudflare Images...');
    try {
      const out = await uploadToCloudflareImages(file);
      setResult(out);
      setStatus('Done ✔');
    } catch (err: any) {
      setStatus('Error: ' + String(err?.message || err));
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="font-semibold text-2xl">
        Cloudflare Images — Direct Upload Demo
      </h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          type="file"
        />
        <button
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
          disabled={!file}
          type="submit"
        >
          Upload
        </button>
      </form>
      {status && <p className="text-gray-600 text-sm">{status}</p>}
      {result?.id && (
        <div className="space-y-2">
          <div className="text-sm">Image ID: {result.id}</div>
          {/* If you have a variant named 'avatar', you can preview like this: */}
          {/* <img src={`https://imagedelivery.net/${process.env.NEXT_PUBLIC_CF_IMAGES_ACCOUNT_HASH}/${result.id}/avatar`} alt="preview" /> */}
        </div>
      )}
    </main>
  );
}
