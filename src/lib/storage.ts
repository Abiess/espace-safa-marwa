const STORAGE_PREFIX = 'receipt_app_';

export const StorageKeys = {
  THEME: `${STORAGE_PREFIX}theme`,
  LOCALE: `${STORAGE_PREFIX}locale`,
  RTL: `${STORAGE_PREFIX}rtl`,
  BACKUP: `${STORAGE_PREFIX}backup`,
  FILTERS: `${STORAGE_PREFIX}filters`,
} as const;

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
  }
}

export function clearAppStorage(): void {
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear app storage:', error);
  }
}
