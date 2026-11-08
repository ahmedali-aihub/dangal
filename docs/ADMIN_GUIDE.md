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

## Video projection (the big video on the home page)

There are two places a video can appear:
- **Home hero:** the full-screen video at the top of the home page.
- **Now Showing section:** an optional video section further down the home page. It only appears when a video is set for it.

### Add a video
Open **Video projection → Add a video**. You have three options:

| Option | When to use |
|---|---|
| **Upload file** | Your own MP4 or WebM file, up to 100 MB. A progress bar shows the upload, and a thumbnail is created automatically. |
| **YouTube / Vimeo** | Paste the video link. Good for longer promo videos. |
| **Mux** | Best quality on every connection. Use this if your developer has set up Mux. |

Give it a title (for example "Diwali Offer 2026"), choose where it should appear, and add tags if you like. Click **Add to library**.

**Tips for great hero videos:** 15–30 seconds, no important text in the video itself, landscape (16:9), 1080p. Keep the file under about 10 MB so phones load it quickly. The free tool HandBrake (preset "Fast 1080p30") does this well.

### Put a video on screen
In the **Video library**, use the **Go live…** dropdown on any video and choose **Home hero**, **Now Showing section** or **Both**. It's live on the website immediately.

### Preview before publishing
Click any thumbnail, or **Preview live** at the top, to see exactly how it will look with the text on top. Switch between desktop and mobile views.

### Undo
Click **Revert to previous video** to switch back to whatever was live before. It's one click.

### Schedule a video (festival offers, new batch launch)
1. Click **Edit** on a video.
2. Under **Schedule**, set the start and end date/time (Hyderabad time) and give it a label such as "New batch launch".
3. Save.

During that window the scheduled video automatically replaces the normal one. When it ends, the normal video comes back by itself.

### Rotate several videos (playlist)
1. **Edit** each video you want, tick **Include in rotating playlist** and set its order.
2. In **Playlist rotation**, tick **Use playlist** and save.

Uploaded videos switch when they finish playing. YouTube and Vimeo videos switch after the number of seconds you set.

### Change the text on top of the video
**Edit → Text over the video.** Type a headline such as `Diwali offer / 30% off annual plans`. The `/` starts a new line. Leave it blank to keep the standard headline.

### Take a video off air
Click **Off air** on the live video. The home page then shows the backup photo.

---

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
Every change is recorded in the system's audit log. If something looks wrong on the website, you can usually fix it by editing or hiding the item. For videos, use **Revert to previous video**.
