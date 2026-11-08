-- ════════════════════════════════════════════════════════════════════════════
--  DANGAL GYM — seed data. Membership prices are REAL (gym's current price list).
--  Trainers, testimonials and gallery are PLACEHOLDERS — replace via the admin panel.
-- ════════════════════════════════════════════════════════════════════════════

insert into public.plans (name, duration, price, original_price, features, highlight, badge, sort_order) values
 ('Monthly',     '1 month',   4000,  null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 1),
 ('Quarterly',   '3 months',  8000,  null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 2),
 ('Half Yearly', '6 months',  12000, null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], false, null, 3),
 ('Yearly',      '12 months', 18000, null, array['Gym access 6:00 AM – 10:00 PM','90 min / day training','Book any slot, 7 days a week','Sports nutrition food','Body assessment'], true, 'Best choice', 4);

insert into public.trainers (name, role, bio, specialties, experience_years, image_url, sort_order) values
 ('Coach Imran Khan', 'Head Coach · Strength & Conditioning', 'Former state-level wrestler turned strength coach. Believes the basics, done perfectly, build legends.', array['Strength','Wrestling conditioning','Fat loss'], 12, 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e', 1),
 ('Coach Ayesha Fatima', 'Women''s Fitness & Nutrition Coach', 'Certified nutritionist who builds strong, sustainable physiques with a no-crash-diet philosophy.', array['Women''s fitness','Nutrition','Posture'], 8, 'https://images.unsplash.com/photo-1594381898411-846e7d193883', 2),
 ('Coach Rakesh Reddy', 'Bodybuilding & Hypertrophy', 'Competitive bodybuilder specialising in muscle gain, contest prep and injury-proof lifting.', array['Hypertrophy','Contest prep','Mobility'], 10, 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5', 3),
 ('Coach Sana Mirza', 'Kids & Senior Fitness Specialist', 'Makes movement joyful for kids and safe for seniors, with a calm, patient coaching style.', array['Kids fitness','Senior fitness','Mobility'], 6, 'https://images.unsplash.com/photo-1574680096145-d05b474e2155', 4);

insert into public.testimonials (name, program, quote, rating, result, sort_order) values
 ('Mohammed Arif', 'I AM THE FITTEST MAN', 'I lost 14 kg in 5 months and gained more strength than I ever had in college. The coaches actually care.', 5, '−14 kg in 5 months', 1),
 ('Sneha Reddy', 'I AM THE FITTEST WOMAN', 'The women''s batch made me comfortable from day one. My posture, energy and confidence are completely different.', 5, 'Stronger & confident', 2),
 ('Suresh Kumar (52)', 'I AM THE FITTEST ELDER (40+)', 'At 52 I thought my gym days were over. The trainers designed a plan around my knees and I feel 10 years younger.', 5, 'Pain-free & active', 3),
 ('Farah (mother of Zaid, 11)', 'I AM THE FITTEST KID', 'My son loves going. He is more disciplined, more active and finally off the screen.', 5, 'Active & disciplined', 4);

insert into public.gallery (title, category, image_url, sort_order) values
 ('Strength floor', 'Facility', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48', 1),
 ('Heavy day', 'Training', 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1', 2),
 ('Conditioning zone', 'Facility', 'https://images.unsplash.com/photo-1599058917212-d750089bc07e', 3),
 ('Racks & plates', 'Facility', 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1', 4),
 ('Women''s batch', 'Community', 'https://images.unsplash.com/photo-1546483875-ad9014c88eba', 5),
 ('Dumbbell row', 'Facility', 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61', 6),
 ('Mobility class', 'Community', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', 7),
 ('Barbell club', 'Training', 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', 8);

insert into public.banners (message, cta_label, cta_href, is_active) values
 ('New batch launch — join this month and get your first week free.', 'Claim free trial', '/contact#trial', true);

-- Sample hero video (YouTube). Replace in Admin → Videos with the gym's own footage.
-- insert into public.videos (title, source, src, placement, is_active) values ('Dangal promo', 'youtube', '<YOUTUBE_ID>', 'both', true);

-- ─── Make yourself the OWNER ───
-- 1. Supabase Dashboard → Authentication → Users → "Add user" (email + strong password).
-- 2. Then run (replace the email):
-- update public.profiles set role = 'owner', is_active = true, full_name = 'Owner'
--   where id = (select id from auth.users where email = 'owner@dangalgym.com');
