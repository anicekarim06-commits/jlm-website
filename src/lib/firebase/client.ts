"use client";

import { getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured(): boolean {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// `getAuth`/`getFirestore`/`getStorage` validate config synchronously and
// throw immediately when NEXT_PUBLIC_FIREBASE_* isn't set — which would
// crash any page that imports this module at all (e.g. the admin login
// page) rather than just the feature that needs it. Lazy getters let
// callers check `isFirebaseConfigured()` first and show a clear message
// instead of a hard crash.
let app: FirebaseApp | undefined;
function getFirebaseApp(): FirebaseApp {
  if (!app)
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return app;
}

let dbInstance: Firestore | undefined;
export function getClientDb(): Firestore {
  if (!dbInstance) dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

let authInstance: Auth | undefined;
export function getClientAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
    // Local development only: sign in against the Auth emulator
    // (`pnpm emulators`) instead of a real project. Never set in
    // staging/production, so behaviour there is unchanged.
    const emulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
    if (emulatorHost) {
      connectAuthEmulator(authInstance, `http://${emulatorHost}`, {
        disableWarnings: true,
      });
    }
  }
  return authInstance;
}

let storageInstance: FirebaseStorage | undefined;
export function getClientStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}
