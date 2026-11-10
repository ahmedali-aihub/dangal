# Dangal Gym — Admin Guide

This guide is for the gym owner and staff. You don't need any technical knowledge.

**Admin address:** `https://www.dangalgym.com/admin`

---

## Signing in

1. Go to `/admin` and enter your email and password.
2. **First time only:** you'll be asked to set up two-factor authentication (2FA).
   - Install **Google Authenticator** or **Microsoft Authenticator** on your phone.
   - Scan the QR code on the screen, then type the 6-digit code from the app.
3. **Every time after that:** enter your password, then the 6-digit code from the app.

> Lost your phone? Ask another owner to disable your account in **Team & access** and re-invite you. Or remove the 2FA factor yourself in Supabase → Authentication → Users.

---

## Home video (the one video on the website)

The website has **one** video: it plays at the top of the home page. Open **Home video** in the sidebar.

- **Replace it:** choose **Upload a file** (MP4 or WebM) or **YouTube / Vimeo link**, then press **Publish to home page**. It goes live straight away and replaces the old one.
- **Words on the video:** type a headline such as `Diwali offer / 30% off annual plans` (the `/` starts a new line) and a sub-line, then **Save words**. Leave them blank to keep the standard headline.
- **Go back to the built-in film:** press **Use built-in film**.

**Tips for a great video:** 15–45 seconds, landscape (16:9), 1080p, under about 10 MB so phones load it fast. The free tool HandBrake (preset "Fast 1080p30") does this well.

## Leads (enquiries and free-trial bookings)

When someone fills in the form on the website, you get an **email and a WhatsApp message** straight away, and the lead appears in **Leads**.

- Click a lead to see the details. You can **Call** or **WhatsApp** them from there.
- Change the **Status** as you follow up: New → Contacted → Trial booked → Converted (or Lost).
- Add **Notes**, for example "Visiting Saturday 7 AM".
- Use the status tabs and search to filter. **CSV** downloads the current list for Excel or Google Sheets.

---

## Pricing, Trainers, Testimonials, Gallery

Each of these works the same way:
- **Add**: the button at the top right.
- **Edit**: change anything, then **Save**. The website updates immediately.
- **Visible on website**: untick this to hide an item without deleting it.
- **Display order**: lower numbers appear first.
- **Photos**: click **Upload image** (JPG, PNG or WebP, max 5 MB). Use well-lit, sharp photos. Trainer photos look best as portraits.

Pricing notes: enter prices in rupees without commas. "Original price" shows struck through, for discounts. **Highlight this plan** makes it the featured cream card.

Testimonials: only publish a member's name, photo or results with their permission.

---

## Offer banner

A slim bar at the bottom of the website, for example "New batch starts 1st Dec — first week free".
- Write the message, the button text and the link (for example `/contact#trial`).
- Optional start and end dates make it appear and disappear automatically.
- Turn **Banner on** off to hide it.

---

## Team & access (owners only)

- **Invite** a staff member with their name and email. They'll get an email to set a password, and must set up 2FA.
- **Staff** can manage leads, gallery and testimonials.
- **Owners** can also manage videos, pricing, trainers, offers and the team.
- **Disable** someone's access immediately, for example when an employee leaves.

---

## Need help?
Every change is recorded in the system's audit log. If something looks wrong on the website, you can usually fix it by editing or hiding the item. For the home video, upload the previous one again or press **Use built-in film**.
