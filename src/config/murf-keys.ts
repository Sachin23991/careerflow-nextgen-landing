// src/config/murf-keys.ts

// Helper to get env variables (works for both Vite and Next.js)
const getEnv = (key: string) => {
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env) {
    // @ts-ignore
    return import.meta.env[`VITE_${key}`];
  }
  return process.env[`NEXT_PUBLIC_${key}`];
};

// We create an array of your 5 keys. 
// The .filter(Boolean) part ensures that if you delete one key later, the app won't crash.
export const MURF_KEYS = [
  getEnv("MURF_KEY_1"),
  getEnv("MURF_KEY_2"),
  getEnv("MURF_KEY_3"),
  getEnv("MURF_KEY_4"),
  getEnv("MURF_KEY_5"),
].filter((k): k is string => !!k && k.length > 0);