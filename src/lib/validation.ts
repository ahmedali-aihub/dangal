import { z } from "zod";

/** Strip tags, control characters and collapse whitespace. Output is still escaped by React/email templates. */
export const clean = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[ \t]+/g, " ")
    .trim();

const text = (max: number) => z.string().max(max).transform(clean);

export const INTERESTS = [
  "I AM THE FITTEST MAN",
  "I AM THE FITTEST WOMAN",
  "I AM THE FITTEST ELDER (40+)",
  "I AM THE FITTEST KID",
  "Personal training",
  "General membership",
] as const;

export const TIMES = ["Early morning (5–8 AM)", "Morning (8–11 AM)", "Afternoon (11 AM–4 PM)", "Evening (4–8 PM)", "Night (8–10 PM)"] as const;

export const enquirySchema = z.object({
  name: text(80).pipe(z.string().min(2, "Please enter your name")),
  phone: z
    .string()
    .transform((s) => s.replace(/[\s()-]/g, ""))
    .pipe(z.string().regex(/^(\+?91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid email").max(120)]).optional(),
  interest: z.enum(INTERESTS).optional().or(z.literal("")),
  preferredTime: z.enum(TIMES).optional().or(z.literal("")),
  message: text(1000).optional(),
  kind: z.enum(["enquiry", "free_trial"]).default("enquiry"),
  consent: z.literal(true, { errorMap: () => ({ message: "Please accept to be contacted" }) }),
  // anti-spam
  website: z.string().max(0).optional(), // honeypot – must stay empty
  startedAt: z.number().int(), // time-trap
  turnstileToken: z.string().max(4096).optional(),
  source: text(200).optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
