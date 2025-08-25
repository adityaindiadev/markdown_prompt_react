export const VERSION_CAP = 20;
export const DOC_ID = "default";
export const STORAGE_KEY = "prompt-editor:document-state:v1";

export function nowISO() {
  return new Date().toISOString();
}

export function truncate(str, n = 80) {
  const s = (str || "").replace(/\s+/g, " ").trim();
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

export function fmtTime(iso) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return iso;
  }
}
