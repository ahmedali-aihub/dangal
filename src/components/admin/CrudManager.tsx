"use client";

import { clsx } from "clsx";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRow, saveRow, type ContentTable } from "@/app/admin/actions/content";
import { uploadImage } from "./upload-client";
import { btn, field, labelText } from "./ui";

export type FieldDef = {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "boolean" | "list" | "image" | "datetime" | "select";
  options?: string[];
  placeholder?: string;
  help?: string;
  required?: boolean;
  half?: boolean;
};

type Row = Record<string, unknown> & { id: string };

const toIST = (iso: unknown) => (typeof iso === "string" && iso ? new Date(new Date(iso).getTime() + 5.5 * 36e5).toISOString().slice(0, 16) : "");
const fromIST = (v: string) => (v ? new Date(`${v}:00+05:30`).toISOString() : null);

/**
 * Generic list + edit drawer for simple content tables. Each table's server action re-validates
 * every field with zod and checks the user's role — this UI is convenience, not security.
 */
export function CrudManager({
  table,
  rows,
  fields,
  columns,
  newLabel,
  emptyText,
  canDelete = true,
  imageField,
}: {
  table: ContentTable;
  rows: Row[];
  fields: FieldDef[];
  columns: { key: string; label: string; format?: "price" | "bool" | "list" | "date" }[];
  newLabel: string;
  emptyText: string;
  canDelete?: boolean;
  imageField?: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [pending, start] = useTransition();
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);

  const notify = (msg: string, err?: boolean) => {
    setToast({ msg, err });
    setTimeout(() => setToast(null), 4000);
  };

  const fmt = (v: unknown, f?: string) => {
    if (f === "price") return typeof v === "number" ? `₹${v.toLocaleString("en-IN")}` : "—";
    if (f === "bool") return v ? "Yes" : "No";
    if (f === "list") return Array.isArray(v) ? v.join(", ") : "";
    if (f === "date") return typeof v === "string" && v ? new Date(v).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "—";
    return v == null || v === "" ? "—" : String(v);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button className={btn.primary} onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" aria-hidden /> {newLabel}
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white">
        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm opacity-70">{emptyText}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-titanium-100 text-xs uppercase tracking-[0.08em] opacity-70">
                <tr>
                  {imageField && <th className="w-16 px-4 py-3 font-medium">Image</th>}
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-medium">
                      {c.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium">Visible</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {rows.map((r) => (
                  <tr key={r.id} className={clsx(!r.is_active && "opacity-70")}>
                    {imageField && (
                      <td className="px-4 py-3">
                        {typeof r[imageField] === "string" && r[imageField] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`${r[imageField]}${String(r[imageField]).includes("unsplash") ? "?w=120&auto=format" : ""}`} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <span className="block h-10 w-10 rounded-lg bg-ink/10" />
                        )}
                      </td>
                    )}
                    {columns.map((c) => (
                      <td key={c.key} className="max-w-[280px] truncate px-4 py-3">
                        {fmt(r[c.key], c.format)}
                      </td>
                    ))}
                    <td className="px-4 py-3">{r.is_active ? <Eye className="h-4 w-4" aria-label="Visible" /> : <EyeOff className="h-4 w-4" aria-label="Hidden" />}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button className={btn.ghost} onClick={() => setEditing(r)}>
                        <Pencil className="h-4 w-4" aria-hidden /> Edit
                      </button>
                      {canDelete && (
                        <button
                          className={btn.danger}
                          disabled={pending}
                          onClick={() =>
                            confirm("Delete this item permanently?") &&
                            start(async () => {
                              const res = await deleteRow(table, r.id);
                              if (res.ok) {
                                notify("Deleted.");
                                router.refresh();
                              } else notify(res.error, true);
                            })
                          }
                        >
                          <Trash2 className="h-4 w-4" aria-hidden />
                          <span className="sr-only">Delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <Drawer
          row={editing === "new" ? null : editing}
          fields={fields}
          pending={pending}
          onClose={() => setEditing(null)}
          onSave={(values) =>
            start(async () => {
              const res = await saveRow(table, editing === "new" ? null : editing.id, values);
              if (res.ok) {
                setEditing(null);
                notify("Saved — the website is updated.");
                router.refresh();
              } else notify(res.error, true);
            })
          }
        />
      )}
      {toast && (
        <div role="status" className={clsx("fixed bottom-6 left-1/2 z-[80] -translate-x-1/2 rounded-full px-5 py-3 text-sm shadow-soft", toast.err ? "bg-red-800 text-white" : "bg-ink text-titanium")}>
          {toast.msg}
        </div>
      )}
    </>
  );
}

function Drawer({ row, fields, pending, onClose, onSave }: { row: Row | null; fields: FieldDef[]; pending: boolean; onClose: () => void; onSave: (v: Record<string, unknown>) => void }) {
  const [images, setImages] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.filter((f) => f.type === "image").map((f) => [f.name, (row?.[f.name] as string) ?? ""])),
  );
  const [uploading, setUploading] = useState<string | null>(null);

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[70] flex justify-end bg-ink-950/50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <form
        className="h-full w-full max-w-lg overflow-y-auto bg-titanium-50 p-6 sm:p-8"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const out: Record<string, unknown> = {};
          for (const f of fields) {
            const raw = fd.get(f.name);
            if (f.type === "boolean") out[f.name] = raw === "on";
            else if (f.type === "number") out[f.name] = raw === "" || raw == null ? null : Number(raw);
            else if (f.type === "list") out[f.name] = String(raw ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
            else if (f.type === "image") out[f.name] = images[f.name] || null;
            else if (f.type === "datetime") out[f.name] = fromIST(String(raw ?? ""));
            else out[f.name] = String(raw ?? "");
          }
          onSave(out);
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light tracking-[-0.03em]">{row ? "Edit" : "Add new"}</h2>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-ink/5">
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          {fields.map((f) => {
            const v = row?.[f.name];
            const wrap = clsx("block", f.half ? "col-span-1" : "col-span-2");
            if (f.type === "boolean")
              return (
                <label key={f.name} className={clsx(wrap, "flex items-center justify-between gap-4 rounded-xl bg-white p-4 text-sm")}>
                  <span>
                    {f.label}
                    {f.help && <span className="block text-xs opacity-70">{f.help}</span>}
                  </span>
                  <input type="checkbox" name={f.name} defaultChecked={row ? Boolean(v) : f.name === "is_active"} className="h-5 w-5 accent-ink" />
                </label>
              );
            if (f.type === "image")
              return (
                <div key={f.name} className={wrap}>
                  <span className={labelText}>{f.label}</span>
                  <div className="flex items-center gap-3">
                    {images[f.name] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${images[f.name]}${images[f.name].includes("unsplash") ? "?w=200&auto=format" : ""}`} alt="" className="h-16 w-16 rounded-xl object-cover" />
                    )}
                    <label className={clsx(btn.secondary, "cursor-pointer")}>
                      {uploading === f.name && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                      {images[f.name] ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploading(f.name);
                          try {
                            const url = await uploadImage(file);
                            setImages((s) => ({ ...s, [f.name]: url }));
                          } catch (err) {
                            alert(err instanceof Error ? err.message : "Upload failed");
                          } finally {
                            setUploading(null);
                          }
                        }}
                      />
                    </label>
                    {images[f.name] && (
                      <button type="button" className={btn.ghost} onClick={() => setImages((s) => ({ ...s, [f.name]: "" }))}>
                        Remove
                      </button>
                    )}
                  </div>
                  <span className="mt-1 block text-xs opacity-70">JPG, PNG, WebP or AVIF · max 5 MB</span>
                </div>
              );
            return (
              <label key={f.name} className={wrap}>
                <span className={labelText}>{f.label}</span>
                {f.type === "textarea" || f.type === "list" ? (
                  <textarea
                    name={f.name}
                    rows={f.type === "list" ? 5 : 4}
                    required={f.required}
                    defaultValue={f.type === "list" ? (Array.isArray(v) ? v.join("\n") : "") : ((v as string) ?? "")}
                    placeholder={f.placeholder}
                    className={clsx(field, "h-auto py-2.5")}
                  />
                ) : f.type === "select" ? (
                  <select name={f.name} defaultValue={(v as string) ?? f.options?.[0]} className={field}>
                    {f.options?.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={f.name}
                    type={f.type === "number" ? "number" : f.type === "datetime" ? "datetime-local" : "text"}
                    required={f.required}
                    defaultValue={f.type === "datetime" ? toIST(v) : v == null ? "" : String(v)}
                    placeholder={f.placeholder}
                    className={field}
                  />
                )}
                {f.help && <span className="mt-1 block text-xs opacity-70">{f.help}</span>}
              </label>
            );
          })}
        </div>
        <div className="sticky bottom-0 -mx-6 mt-8 flex gap-2 border-t border-ink/10 bg-titanium-50 px-6 py-4 sm:-mx-8 sm:px-8">
          <button className={btn.primary} disabled={pending || !!uploading}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />} Save
          </button>
          <button type="button" className={btn.secondary} onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
