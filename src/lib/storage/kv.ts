function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function getStore(): Storage | null {
  if (!isBrowser()) return null;
  return window.localStorage;
}

export function getJSON<T>(key: string): T | null {
  const store = getStore();
  if (!store) return null;
  const raw = store.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setJSON<T>(key: string, value: T): void {
  const store = getStore();
  if (!store) return;
  store.setItem(key, JSON.stringify(value));
}

export function remove(key: string): void {
  const store = getStore();
  if (!store) return;
  store.removeItem(key);
}

