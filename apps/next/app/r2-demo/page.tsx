'use client';

import React from 'react';
import { uploadToR2 } from '../../lib/uploads';

export default function R2DemoPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<string>('');
  const [result, setResult] = React.useState<{ key?: string } | null>(null);

  function guessExt(name?: string | null) {
    if (!name) return;
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop() : undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading to R2 via presigned PUT...');
    try {
      const ext = guessExt(file.name);
      const out = await uploadToR2(file, {
        contentType: file.type || 'application/octet-stream',
        ext,
      });
      setResult(out);
      setStatus('Done ✔');
    } catch (err: any) {
      setStatus(`Error: ${String(err?.message || err)}`);
    }
  }

  return (
    <main className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="font-semibold text-2xl">
        Cloudflare R2 — Presigned PUT Demo
      </h1>
      <form className="space-y-4" onSubmit={onSubmit}>
        <input
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
      {result?.key && (
        <div className="space-y-2">
          <div className="text-sm">R2 Key: {result.key}</div>
        </div>
      )}
    </main>
  );
}
