import "server-only";
import { MAX_VIDEO_MB } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Server-side upload policy. Files go browser → Supabase Storage via a short-lived signed URL
 * (so large videos never pass through Vercel), then we VERIFY the stored object's real bytes
 * (magic numbers) and size before accepting it. Anything that fails is deleted.
 */
export const BUCKET = "media";

export const UPLOAD_KINDS = {
  video: {
    maxBytes: MAX_VIDEO_MB * 1024 * 1024,
    types: { "video/mp4": "mp4", "video/webm": "webm" } as Record<string, string>,
    folder: "videos",
  },
  image: {
    maxBytes: 5 * 1024 * 1024,
    types: { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" } as Record<string, string>,
    folder: "images",
  },
} as const;

export type UploadKind = keyof typeof UPLOAD_KINDS;

export function checkDeclared(kind: UploadKind, type: string, size: number) {
  const rule = UPLOAD_KINDS[kind];
  const ext = rule.types[type];
  if (!ext) throw new Error(kind === "video" ? "Only MP4 or WebM videos are allowed." : "Only JPG, PNG, WebP or AVIF images are allowed.");
  if (!Number.isFinite(size) || size <= 0) throw new Error("Empty file.");
  if (size > rule.maxBytes) throw new Error(`File too large. Max ${Math.round(rule.maxBytes / 1024 / 1024)} MB.`);
  return ext;
}

export async function createSignedUpload(kind: UploadKind, type: string, size: number) {
  const ext = checkDeclared(kind, type, size);
  const path = `${UPLOAD_KINDS[kind].folder}/${new Date().toISOString().slice(0, 7)}/${crypto.randomUUID()}.${ext}`;
  const { data, error } = await createAdminClient().storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message ?? "Could not create upload URL");
  return { path, signedUrl: data.signedUrl };
}

function sniff(bytes: Uint8Array): string | null {
  const s = (a: number, b: number) => String.fromCharCode(...bytes.slice(a, b));
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "video/webm";
  if (s(4, 8) === "ftyp") {
    const brand = s(8, 12);
    if (/^(avif|avis)$/.test(brand)) return "image/avif";
    return "video/mp4";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && s(1, 4) === "PNG") return "image/png";
  if (s(0, 4) === "RIFF" && s(8, 12) === "WEBP") return "image/webp";
  return null;
}

/** Verify an uploaded object; returns its public URL or deletes it and throws. */
export async function verifyUploaded(kind: UploadKind, path: string): Promise<string> {
  const rule = UPLOAD_KINDS[kind];
  if (!path.startsWith(`${rule.folder}/`) || path.includes("..") || !/^[\w/.-]+$/.test(path)) throw new Error("Invalid path.");

  const sb = createAdminClient();
  const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(path);
  const reject = async (msg: string) => {
    await sb.storage.from(BUCKET).remove([path]);
    throw new Error(msg);
  };

  const res = await fetch(pub.publicUrl, { headers: { Range: "bytes=0-31" }, cache: "no-store" });
  if (!res.ok) throw new Error("Upload not found. Please try again.");
  const total = Number(res.headers.get("content-range")?.split("/")[1] ?? res.headers.get("content-length") ?? 0);
  const bytes = new Uint8Array(await res.arrayBuffer()).slice(0, 32);

  const real = sniff(bytes);
  if (!real || !(real in rule.types)) return reject("File content doesn't match an allowed format.");
  if (total > rule.maxBytes) return reject("File exceeds the size limit.");
  return pub.publicUrl;
}

export async function removeObject(path: string | null | undefined) {
  if (!path) return;
  await createAdminClient().storage.from(BUCKET).remove([path]);
}
