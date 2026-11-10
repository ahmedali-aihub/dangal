/**
 * Browsers can all play H.264 (the normal MP4). H.265/HEVC — the default of many phone cameras — only plays in
 * some browsers, so a visitor on Chrome or Firefox would see a frozen picture. Catch it at upload time.
 * Returns a message when the file isn't safe for the website, otherwise null.
 */
export async function checkWebCompatible(file: File): Promise<string | null> {
  if (file.type === "video/webm") return null;
  const CHUNK = 4 * 1024 * 1024;
  const read = async (b: Blob) => new TextDecoder("latin1").decode(await b.arrayBuffer());
  // The codec tag lives in the "moov" box, which is at the start of web-optimised files and at the end of camera files.
  const text = (await read(file.slice(0, CHUNK))) + (file.size > CHUNK ? await read(file.slice(Math.max(CHUNK, file.size - CHUNK))) : "");
  const hevc = text.includes("hvc1") || text.includes("hev1");
  const h264 = text.includes("avc1");
  if (hevc && !h264) {
    return "This video uses H.265 (HEVC), which many browsers can't play. Re-export it as a standard H.264 MP4 — in HandBrake choose the “Fast 1080p30” preset, or on an iPhone set Settings → Camera → Formats → Most Compatible — then upload it again.";
  }
  return null;
}
