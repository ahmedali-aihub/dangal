import "server-only";

/**
 * Fixed-window rate limiter. Uses Upstash Redis (REST) when configured — required for correct limits
 * across Vercel serverless instances — and falls back to per-instance memory otherwise.
 */
const memory = new Map<string, { count: number; reset: number }>();

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; remaining: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const k = `rl:${key}`;

  if (url && token) {
    try {
      const res = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify([
          ["INCR", k],
          ["EXPIRE", k, String(windowSec), "NX"],
        ]),
        cache: "no-store",
      });
      const [incr] = (await res.json()) as { result: number }[];
      return { ok: incr.result <= limit, remaining: Math.max(0, limit - incr.result) };
    } catch {
      /* fall through to memory */
    }
  }

  const now = Date.now();
  const entry = memory.get(k);
  if (!entry || entry.reset < now) {
    memory.set(k, { count: 1, reset: now + windowSec * 1000 });
    if (memory.size > 5000) for (const [mk, v] of memory) if (v.reset < now) memory.delete(mk);
    return { ok: true, remaining: limit - 1 };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, remaining: Math.max(0, limit - entry.count) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}
