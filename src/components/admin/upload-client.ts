"use client";

import { finalizeImageUpload, requestImageUpload } from "@/app/admin/actions/content";

/** PUT a file to a Supabase signed upload URL with progress (fetch can't report upload progress). */
export function putToSignedUrl(signedUrl: string, file: Blob, onProgress?: (pct: number) => void, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (anon) xhr.setRequestHeader("apikey", anon);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    signal?.addEventListener("abort", () => xhr.abort());
    const body = new FormData();
    body.append("cacheControl", "31536000");
    body.append("", file);
    xhr.send(body);
  });
}

/** Upload an image (validated client + server side). Returns its public URL. */
export async function uploadImage(file: Blob, onProgress?: (p: number) => void): Promise<string> {
  const req = await requestImageUpload(file.type, file.size);
  if (!req.ok) throw new Error(req.error);
  await putToSignedUrl(req.data!.signedUrl, file, onProgress);
  const fin = await finalizeImageUpload(req.data!.path);
  if (!fin.ok) throw new Error(fin.error);
  return fin.data!.url;
}

/** Grab a frame ~1s into a local video file as a JPEG poster. */
export function capturePoster(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.muted = true;
    v.playsInline = true;
    v.preload = "metadata";
    v.src = url;
    const done = (b: Blob | null) => {
      URL.revokeObjectURL(url);
      resolve(b);
    };
    const timer = setTimeout(() => done(null), 8000);
    v.onloadedmetadata = () => {
      v.currentTime = Math.min(1, (v.duration || 2) / 3);
    };
    v.onseeked = () => {
      clearTimeout(timer);
      const w = Math.min(1600, v.videoWidth || 1280);
      const h = Math.round(w * ((v.videoHeight || 720) / (v.videoWidth || 1280)));
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      c.getContext("2d")?.drawImage(v, 0, 0, w, h);
      c.toBlob((b) => done(b), "image/jpeg", 0.82);
    };
    v.onerror = () => {
      clearTimeout(timer);
      done(null);
    };
  });
}
