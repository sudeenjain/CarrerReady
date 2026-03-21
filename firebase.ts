import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// SECURITY: Ensure environment variables are present before initialization
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey || apiKey === 'your_api_key_here') {
  console.warn("FIREBASE_CONFIG_MISSING: Firebase API Key is not set. Authentication features will be disabled. Please set VITE_FIREBASE_API_KEY in your .env file.");
}

const firebaseConfig = {
  apiKey: apiKey || 'missing-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== 'undefined' && apiKey) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics initialization bypassed.");
  }
}
export { analytics };