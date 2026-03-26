const DEBOUNCE_MS = 300;
const timers: Record<string, ReturnType<typeof setTimeout>> = {};

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw) as T;
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from localStorage:`, e);
  }
  return fallback;
}

export function saveToStorage<T>(key: string, data: T, onSaved?: () => void): void {
  if (timers[key]) {
    clearTimeout(timers[key]);
  }
  timers[key] = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      onSaved?.();
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  }, DEBOUNCE_MS);
}

export function clearStorage(keys: string[]): void {
  keys.forEach(key => localStorage.removeItem(key));
}
