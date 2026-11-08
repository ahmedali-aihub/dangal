"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { run } from "@/lib/admin/run";
import { createSignedUpload, verifyUploaded } from "@/lib/admin/uploads";
import { requireRole, requireStaff, type Resource } from "@/lib/auth";
import { TAGS } from "@/lib/data";
import { createAdminClient } from "@/lib/supabase/admin";
import { clean } from "@/lib/validation";

const str = (max: number) => z.string().max(max).transform(clean);
const optStr = (max: number) => z.union([z.literal(""), z.null(), z.undefined(), str(max)]).transform((v) => (v ? v : null));
const list = z.array(str(160)).max(20).default([]);
const url = z
  .union([z.literal(""), z.null(), z.undefined(), z.string().url().max(600).refine((u) => u.startsWith("https://"), "Must be an https URL")])
  .transform((v) => v || null);
const href = z
  .union([z.literal(""), z.null(), z.undefined(), z.string().max(300).regex(/^(\/[\w\-/#?=&%.]*|https:\/\/\S+)$/, "Use a /path or https:// link")])
  .transform((v) => v || null);
const date = z
  .union([z.literal(""), z.null(), z.undefined(), z.string().datetime({ offset: true })])
  .transform((v) => v || null);

/** Whitelisted tables, their permission resource, cache tag and validation schema. */
const TABLES = {
  plans: {
    resource: "pricing",
    tag: TAGS.plans,
    schema: z.object({
      name: str(60).pipe(z.string().min(1)),
      duration: str(40).pipe(z.string().min(1)),
      price: z.coerce.number().int().min(0).max(10_000_000),
      original_price: z.union([z.null(), z.undefined(), z.coerce.number().int().min(0).max(10_000_000)]).transform((v) => v ?? null),
      features: list,
      highlight: z.boolean().default(false),
      badge: optStr(30),
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
  },
  trainers: {
    resource: "trainers",
    tag: TAGS.trainers,
    schema: z.object({
      name: str(80).pipe(z.string().min(1)),
      role: str(120).pipe(z.string().min(1)),
      bio: str(800),
      specialties: list,
      experience_years: z.coerce.number().int().min(0).max(80),
      image_url: url,
      instagram: url,
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
  },
  testimonials: {
    resource: "testimonials",
    tag: TAGS.testimonials,
    schema: z.object({
      name: str(80).pipe(z.string().min(1)),
      program: optStr(80),
      quote: str(600).pipe(z.string().min(5)),
      rating: z.coerce.number().int().min(1).max(5),
      result: optStr(60),
      image_url: url,
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
  },
  gallery: {
    resource: "gallery",
    tag: TAGS.gallery,
    schema: z.object({
      title: str(80).pipe(z.string().min(1)),
      category: str(40).pipe(z.string().min(1)),
      image_url: z.string().url().max(600),
      sort_order: z.coerce.number().int().default(0),
      is_active: z.boolean().default(true),
    }),
  },
  banners: {
    resource: "banner",
    tag: TAGS.banner,
    schema: z.object({
      message: str(160).pipe(z.string().min(3)),
      cta_label: optStr(30),
      cta_href: href,
      is_active: z.boolean().default(false),
      starts_at: date,
      ends_at: date,
    }),
  },
} as const satisfies Record<string, { resource: Resource; tag: string; schema: z.ZodTypeAny }>;

export type ContentTable = keyof typeof TABLES;

function config(table: string) {
  if (!(table in TABLES)) throw new Error("Unknown table");
  return TABLES[table as ContentTable];
}

async function audit(actor: string, action: string, entity: string, id?: string) {
  await createAdminClient().from("audit_log").insert({ actor, action, entity, entity_id: id ?? null });
}

export async function saveRow(table: ContentTable, id: string | null, values: Record<string, unknown>) {
  return run(async () => {
    const cfg = config(table);
    const session = await requireRole(cfg.resource);
    const parsed = cfg.schema.safeParse(values);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      throw new Error(`${first.path.join(".") || "Field"}: ${first.message}`);
    }
    const sb = createAdminClient();
    const values_ = parsed.data as Record<string, unknown>;
    const q = id ? sb.from(table).update(values_).eq("id", id).select("id").single() : sb.from(table).insert(values_).select("id").single();
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    await audit(session.userId, id ? "update" : "create", table, data.id);
    revalidateTag(cfg.tag);
    revalidatePath("/", "layout");
    return { id: data.id as string };
  });
}

export async function deleteRow(table: ContentTable, id: string) {
  return run(async () => {
    const cfg = config(table);
    const session = await requireRole(cfg.resource);
    if (!z.string().uuid().safeParse(id).success) throw new Error("Invalid id");
    const { error } = await createAdminClient().from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    await audit(session.userId, "delete", table, id);
    revalidateTag(cfg.tag);
    revalidatePath("/", "layout");
  });
}

/** Image uploads for trainers / gallery / testimonials / posters. */
export async function requestImageUpload(type: string, size: number) {
  return run(async () => {
    await requireStaff();
    return createSignedUpload("image", type, size);
  });
}

export async function finalizeImageUpload(path: string) {
  return run(async () => {
    await requireStaff();
    return { url: await verifyUploaded("image", path) };
  });
}
