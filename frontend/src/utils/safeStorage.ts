// Utility functions for safely accessing localStorage and sessionStorage, with fallbacks for environments where storage is unavailable (e.g., private browsing mode).

export const safeGetItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    console.warn(`LocalStorage blocked: Cannot get item '${key}'`);
    return null;
  }
};

export const safeSetItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    console.warn(`LocalStorage blocked: Cannot set item '${key}'`);
  }
};

export const safeRemoveItem = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    console.warn(`LocalStorage blocked: Cannot remove item '${key}'`);
  }
};

export const safeSessionGetItem = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    console.warn(`SessionStorage blocked: Cannot get item '${key}'`);
    return null;
  }
};

export const safeSessionSetItem = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    console.warn(`SessionStorage blocked: Cannot set item '${key}'`);
  }
};

export const safeSessionRemoveItem = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    console.warn(`SessionStorage blocked: Cannot remove item '${key}'`);
  }
};

export const zustandSafeStorage = {
  getItem: safeGetItem,
  setItem: safeSetItem,
  removeItem: safeRemoveItem,
};
