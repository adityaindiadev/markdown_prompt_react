import { STORAGE_KEY } from "./utils";

export function safeLoad() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function safeSave(state, onError) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    onError?.(e);
    return false;
  }
}
