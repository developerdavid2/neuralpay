import { getApp, getApps, initializeApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

function getFirebaseApp() {
  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

let messagingPromise: Promise<Messaging | null> | null = null;

export function getFirebaseMessaging(): Promise<Messaging | null> {
  if (typeof window === "undefined") {
    // Server-side evaluation — nothing to do here.
    return Promise.resolve(null);
  }

  if (!messagingPromise) {
    messagingPromise = isSupported().then((supported) =>
      supported ? getMessaging(getFirebaseApp()) : null,
    );
  }

  return messagingPromise;
}
