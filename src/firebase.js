// src/firebase.js

// Replace top-level static imports with a runtime/lazy loader and graceful fallback.

const firebaseConfig = {
  apiKey: "AIzaSyCQ0X7aXiiBxDLCXf_rp3CpNelypTpMAUo",
  authDomain: "carrerflow-a73c1.firebaseapp.com",
  projectId: "carrerflow-a73c1",
  storageBucket: "carrerflow-a73c1.firebasestorage.app",
  messagingSenderId: "391235321572",
  appId: "1:391235321572:web:5895cd68d3487c038bb6f1",
  measurementId: "G-98NVRH3QQB"
};

// Exported bindings (live bindings updated once modules load)
export let app = null;
export let analytics = null;
export let auth = null;
export let db = null;
export let storage = null;

// Lazy initialize Firebase only in the browser and only if packages are available.
// This avoids Vite failing on missing static imports during dev if packages are not installed.
(async function initFirebase() {
  if (typeof window === "undefined" || typeof window.document === "undefined") {
    // Not running in a browser environment (SSR). Skip initialization.
    return;
  }

  try {
    // Use dynamic imports so bundlers don't treat these as top-level static imports.
    const firebaseAppMod = await import("firebase/app");
    const initializeApp = firebaseAppMod.initializeApp || firebaseAppMod.default?.initializeApp;
    if (!initializeApp) throw new Error("firebase/app does not expose initializeApp");

    // Initialize app
    app = initializeApp(firebaseConfig);

    // Try to load optional modules; each may fail if the package isn't installed.
    try {
      const analyticsMod = await import("firebase/analytics");
      const getAnalytics = analyticsMod.getAnalytics || analyticsMod.default?.getAnalytics;
      if (getAnalytics && app) analytics = getAnalytics(app);
    } catch (_) {
      // ignore: analytics not installed or not available in environment
    }

    try {
      const authMod = await import("firebase/auth");
      const getAuth = authMod.getAuth || authMod.default?.getAuth;
      if (getAuth && app) auth = getAuth(app);
    } catch (_) {
      // ignore: auth not installed
    }

    try {
      const dbMod = await import("firebase/firestore");
      const getFirestore = dbMod.getFirestore || dbMod.default?.getFirestore;
      if (getFirestore && app) db = getFirestore(app);
    } catch (_) {
      // ignore: firestore not installed
    }

    try {
      const storageMod = await import("firebase/storage");
      const getStorage = storageMod.getStorage || storageMod.default?.getStorage;
      if (getStorage && app) storage = getStorage(app);
    } catch (_) {
      // ignore: storage not installed
    }
  } catch (err) {
    // If dynamic import fails (packages missing), show a clear console hint instead of breaking the dev server.
    // To fully resolve the Vite errors, install the packages:
    //   npm install firebase axios
    // or
    //   yarn add firebase axios
    // After installing, restart the dev server.
    // eslint-disable-next-line no-console
    console.warn(
      "[firebase] Could not initialize Firebase — missing packages? Run `npm install firebase axios` and restart the dev server.",
      err && err.message ? err.message : err
    );
  }
})();

// Default export remains for callers that expect it; it may be null until initialized.
export default app;
