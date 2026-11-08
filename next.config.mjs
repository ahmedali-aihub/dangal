import os from "node:os";

/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV === "development";

// HTTPS-only protections (upgrade-insecure-requests + HSTS) must apply ONLY on a real HTTPS deployment.
// On a plain-http dev/LAN address (e.g. http://192.168.x.x:3002) they make the browser fetch CSS, fonts and
// images over https://, which doesn't exist, so the page renders completely unstyled.
const onHttps =
  !isDev && (Boolean(process.env.VERCEL) || /^https:\/\//.test(process.env.NEXT_PUBLIC_SITE_URL || ""));

// Let phones/other PCs on the same Wi-Fi load the dev server (Next blocks cross-origin dev assets by default).
const lanIps = Object.values(os.networkInterfaces())
  .flat()
  .filter((i) => i && i.family === "IPv4" && !i.internal)
  .map((i) => i.address);

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host
  : null;

// Content-Security-Policy. 'unsafe-inline' for scripts is required by Next's inline bootstrap
// unless you move to nonce-based CSP (which forces dynamic rendering and costs Lighthouse score).
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com" +
    (process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""),
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com https://i.ytimg.com https://i.vimeocdn.com https://image.mux.com https://*.cdninstagram.com${supabaseHost ? ` https://${supabaseHost}` : ""}`,
  `media-src 'self' blob: https://stream.mux.com${supabaseHost ? ` https://${supabaseHost}` : ""}`,
  "font-src 'self' data:",
  `connect-src 'self' https://stream.mux.com https://vimeo.com${supabaseHost ? ` https://${supabaseHost} wss://${supabaseHost}` : ""}`,
  "frame-src https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com https://www.google.com https://challenges.cloudflare.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(onHttps ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  ...(onHttps ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Lets a verification build run alongside a dev server without sharing `.next` (e.g. NEXT_DIST_DIR=.next-verify).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: lanIps,
  // Tree-shake icon/animation packages so each page ships (and the dev server compiles) only what it uses.
  experimental: { optimizePackageImports: ["lucide-react"], serverActions: { bodySizeLimit: "2mb" } },
  images: {
    // Dev only: skip the image optimiser (each first view otherwise waits on a server-side fetch + resize).
    // Production still serves optimised AVIF/WebP.
    unoptimized: isDev,
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }, // PLACEHOLDER imagery - replace with real photos
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "image.mux.com" },
      ...(supabaseHost ? [{ protocol: "https", hostname: supabaseHost }] : []),
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
