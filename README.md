# Dangal Gym — website & admin panel

Production website for **Dangal Gym**, #501, 5th Floor, Aries Plaza, St Ann's College Street, Mehdipatnam, Hyderabad 500028.

- **Public site:** Home (with the cinematic video hero), four signature programs (I AM THE FITTEST MAN / WOMAN / ELDER (40+) / KID), Training, Nutrition (with a BMI and calorie calculator), Trainers, Membership, Schedule, Gallery, Blog, Contact (free-trial booking), Privacy and Terms.
- **Admin panel (`/admin`):** video projection control, leads with CSV export, pricing, trainers, testimonials, gallery, offer banner and team access. Every admin login uses a password plus 2FA.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Vercel. Optional: Mux (adaptive video), Resend (email), WhatsApp Cloud API, Cloudflare Turnstile, Upstash Redis.

**About the animations:** an earlier version used Framer Motion. It was replaced to reach the Lighthouse target: on mobile its runtime and hydration-gated reveals cost about 45 kB and delayed LCP. Scroll reveals and parallax now use native CSS scroll-driven animations (`animation-timeline: view()`), which need no JavaScript. Browsers without support simply show the content without the animation. Hero text animates with pure CSS. Lenis smooth scroll loads only on desktop pointer devices. All motion respects `prefers-reduced-motion`.

**The motion system:** headings animate in word by word as they scroll into view (`SplitText`), and the home-page statement writes itself on as you scroll. Images open with a curtain reveal and settle from a slight zoom. The hero drifts out and zooms as you scroll past it. The menu button doubles as a scroll-progress ring, and the header stays pinned while you scroll. Client-side navigations get a space-black curtain page transition (never on first load). Buttons roll their text on hover.

**Interactive features:**
- "Find your program" quiz (`ProgramFinder`)
- Expanding program panels on desktop, a swipe carousel on mobile (`ProgramShowcase`)
- Total / per-month price toggle with savings (`PlanSwitcher`)
- "Live now" / "Up next" on the timetable
- Story-style swipeable testimonials
- Cursor spotlight on the "Why Dangal" cards
- Trainer bios that slide up on hover
- Brand marquee
- Swipeable gallery lightbox

**Build checks without stopping a dev server:** `NEXT_DIST_DIR=.next-verify npm run build` writes to its own folder.

> The gym owner's guide is in [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md). Everything that needs real content before launch is listed in [docs/REPLACE_BEFORE_LAUNCH.md](docs/REPLACE_BEFORE_LAUNCH.md).

---

## 1. Run locally (5 minutes, no accounts needed)

```bash
npm install
cp .env.example .env.local   # leave everything blank for demo mode
npm run dev                  # http://localhost:3000
```

With no Supabase keys the site runs in **demo mode**: all pages work using the sample content in `src/content/`. In local development, `/admin` opens a read-only preview of the panel. Saving changes needs Supabase.

## 2. Connect Supabase

Your project is already linked in `.env.local` (URL + publishable key). To finish:

1. **Create the tables:** Supabase Dashboard → **SQL Editor → New query** → paste all of [`supabase/setup.sql`](supabase/setup.sql) → **Run**. It's safe to run again; sample content is only added to empty tables.
2. **Add the secret key:** Dashboard → **Project Settings → API Keys → Secret keys** → copy it (starts with `sb_secret_`) into `.env.local` after `SUPABASE_SERVICE_ROLE_KEY=`. This stays on the server only; never share or commit it.
3. **Create the owner login:** Dashboard → **Authentication → Users → Add user** (email + strong password, tick *Auto Confirm User*). Then run this in the SQL Editor with your email:
   ```sql
   update public.profiles set role = 'owner', is_active = true, full_name = 'Owner'
   where id = (select id from auth.users where email = 'YOUR-EMAIL@example.com');
   ```
4. Go to **Authentication → Sign In / Providers → Email** and turn **off** "Allow new users to sign up" (staff are added from Admin → Team).
5. Restart the dev server and open `/admin` → sign in → set up 2FA on first login.

Until step 1 is done the public site simply shows its built-in content; nothing breaks. The Supabase CLI isn't required (`supabase login` / `link` / `init` are optional and need your database password, which isn't needed for anything above).

## 3. Optional integrations

| Feature | Env vars | Notes |
|---|---|---|
| Email alert for each lead | `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL` | Verify the `dangalgym.com` domain in Resend. |
| WhatsApp alert for each lead | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `OWNER_WHATSAPP` | Meta WhatsApp Cloud API. For messages outside the 24-hour window, create an approved template with 3 body variables (name, phone, interest) and set `WHATSAPP_TEMPLATE_NAME`. |
| Bot protection | `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile. The honeypot, time-trap and rate limit always run. |
| Rate limits across servers | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Recommended on Vercel. Without it, limits are per server instance. |
| Instagram feed | `INSTAGRAM_ACCESS_TOKEN` | Long-lived Instagram Graph API token. Without it, a styled grid links to @dangalgym. |
| Adaptive (HLS) video | — | Upload the video to Mux, then paste the playback ID in Admin → Video projection → Mux. |

## 4. Deploy to Vercel

1. Push this folder to a private GitHub repository.
2. In Vercel, choose **Add New → Project**, import the repository and keep the Framework setting as Next.js.
3. Add every variable from `.env.local` under **Settings → Environment Variables**. Set `NEXT_PUBLIC_SITE_URL=https://www.dangalgym.com`.
4. Deploy. Then add the domain under **Settings → Domains**. HTTPS is automatic, and HSTS is already set in `next.config.mjs`.
5. In Supabase, add `https://www.dangalgym.com` to the Auth redirect URLs.
6. Submit `https://www.dangalgym.com/sitemap.xml` in Google Search Console, and link the site from the Google Business Profile.

## 5. Architecture

```
src/
  app/
    (site)/            public pages (shared header/footer, JSON-LD)
    admin/
      (panel)/         authenticated admin screens
      actions/         server actions — every one re-checks role + validates with zod
      login/, security/ password login, TOTP verify, 2FA enrolment
    api/enquiry/       lead intake: origin check, rate limit, honeypot, Turnstile, zod, notify
  components/          UI (home/, sections/, video/, admin/, ...)
  content/             fallback/demo content, programs, blog
  lib/
    data.ts            cached public reads (tag-revalidated) with demo fallback
    video.ts           picks the one live home video (else the built-in film)
    auth.ts            requireStaff / requireRole (session + profile + AAL2)
    admin/uploads.ts   signed uploads + server-side magic-byte & size verification
supabase/schema.sql    tables, RLS, storage bucket limits, triggers
```

**How "changes go live instantly" works:** public pages read data through `unstable_cache` with tags. Every admin mutation calls `revalidateTag(...)`, so the next visitor sees the change, with no redeploy.

**Home video:** the site has a single video, in the home hero. The newest published, live video is used; with none set, the built-in film plays. The player autoplays muted and inline with a poster and loop. It mounts after page load and pauses when off-screen. On data-saver or 2G connections, and for reduced-motion users, it falls back to the image with a "Play video" opt-in. If the video errors, it falls back to the image. Visitors get a sound toggle.

## 6. Security checklist (implemented)

- HTTPS + HSTS, CSP, `X-Frame-Options: DENY`, `nosniff`, a strict Referrer-Policy and a Permissions-Policy (`next.config.mjs`).
- Passwords are hashed by Supabase Auth (bcrypt). **TOTP 2FA is required** for every admin (`ADMIN_REQUIRE_2FA=true`), and the database's RLS also requires an AAL2 session.
- Role-based access: **owner** has full access; **staff** can manage leads, gallery and testimonials. Every server action checks the role again, and every change is written to `audit_log`.
- Row Level Security on every table. The public can only read published content; nothing can be written with the anon key.
- Enquiry form: same-origin check plus JSON-only requests (CSRF protection), rate limit, honeypot, time-trap, optional Turnstile, zod validation and sanitisation, and an HTML-escaped email.
- Server actions: Next.js's built-in origin check (CSRF protection), zod validation on every input, and service-role use only after the role check.
- Uploads: type and size are checked in the browser, re-checked by the server before it issues a signed URL, and enforced again by the bucket's own limits. After upload, the server reads the file's first bytes to confirm it really is MP4/WebM/JPEG/PNG/WebP/AVIF, and deletes it otherwise. Upload paths are random UUIDs.
- CSV export guards against spreadsheet formula injection.
- Login is rate-limited per IP and per email, and the error messages don't reveal which accounts exist.

## 7. Performance notes

- `next/image` with AVIF/WebP and blur placeholders. The hero poster is the LCP image and is loaded with priority. Fonts are self-hosted via `next/font`.
- The video only starts loading once it's near the viewport; hls.js is only downloaded when a Mux video is used.
- Pages are static or ISR. Admin pages are dynamic and `noindex`.
- To reach Lighthouse 95+: use real photos at most 2560px wide, keep hero videos around 6–10 MB (1080p, H.264, ~5 Mbps, 15–30 seconds), or use Mux.

## Scripts

| | |
|---|---|
| `npm run dev` | dev server (reachable from your phone on the same Wi-Fi). **Slow on first visit to each page (it compiles on demand).** |
| `npm run preview` | **fast** production build + server on port 3002 (pages open in milliseconds). Use this to demo or test on phones. |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
