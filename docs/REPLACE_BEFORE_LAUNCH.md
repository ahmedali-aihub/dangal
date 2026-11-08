# Replace before launch

Everything below is placeholder content, clearly marked in the code with `PLACEHOLDER` or `TODO(owner)`. Most of it can be changed in the admin panel after launch. Items marked 🔧 need a small code edit.

## Done ✓
- **Logo:** redrawn as a vector from the gym's badge (`src/components/layout/Logo.tsx`). The original PNG is in `public/brand/`. A high-resolution or vector original would still be welcome, to check the lettering.
- **Membership prices:** ₹4,000 / ₹8,000 / ₹12,000 / ₹18,000, with Yearly as "Best choice". Set in `src/content/data.ts` and `supabase/seed.sql`, and editable in Admin → Pricing.
- **Gym film:** `public/videos/dangal-film.mp4` plays in the hero and in "The Dangal Film" section by default.
- **Opening hours:** Mon–Sat 6:00 AM – 10:00 PM (from the price list).

## To confirm
- Plan feature "Book any slot, 7 days a week": the old site said "Book anytime for 7 Weeks", which looks like a typo.
- **Sunday hours** (currently 6:00 AM – 12:00 PM): `src/lib/site.ts`.
- **Instagram handle:** the film shows **@dangalgymindia**, but the site links to **@dangalgym**. Which one is correct? See `src/lib/site.ts`.
- **A higher-quality film:** the current file is 854×480. A 1080p export would look sharper on large screens.

## Needed from the owner

| Item | Where it goes | How |
|---|---|---|
| **Real photos**: floor, equipment, classes, members, exterior (at least 15) | `src/lib/images.ts` (one file maps every image) + Admin → Gallery | 🔧 + admin |
| **Trainer names, roles, bios, portraits** | Admin → Trainers | admin |
| **Real testimonials** (with permission) | Admin → Testimonials | admin |
| **Stats**: members, trainers, years, transformations | `src/content/data.ts` → `STATS` | 🔧 |
| **Class timetable** | `src/content/data.ts` → `SCHEDULE`; program pages in `src/content/programs.ts` | 🔧 |
| **Opening hours** | `src/lib/site.ts` → `hours` (also used by Google rich results) | 🔧 |
| **Exact map coordinates** + Google Business Profile link | `src/lib/site.ts` → `geo`, `googleBusinessUrl`, `googleReviewUrl` | 🔧 |
| **Facebook page URL** | `src/lib/site.ts` → `socials.facebook` | 🔧 |
| **Equipment list** | `src/app/(site)/training/page.tsx` | 🔧 |
| **Program copy review** (claims, ages, timings) | `src/content/programs.ts` | 🔧 |
| **Blog articles** (review or replace) | `src/content/blog.ts` | 🔧 |
| **Refund / freeze / transfer policy** | `src/app/(site)/terms/page.tsx` | 🔧 + legal review |
| **Privacy policy review** | `src/app/(site)/privacy/page.tsx` | legal review |

## Accounts to create
- Supabase (database, login, file storage) — required
- Vercel (hosting) — required
- Resend (lead emails) — recommended
- Meta WhatsApp Business / Cloud API (lead WhatsApp alerts) — recommended
- Cloudflare Turnstile (spam protection) — recommended
- Mux (adaptive video streaming) — optional
- Upstash Redis (rate limiting on Vercel) — recommended
