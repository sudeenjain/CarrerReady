import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Prefer env vars (VITE_FIREBASE_* or FIREBASE_* in .env) for production; fallback for local dev
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCj822cVJ5nFky7AYACDsl7H16MyjcF70M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "carrerready-ai.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "carrerready-ai",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "carrerready-ai.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "342969536934",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:342969536934:web:6cf1b014ff9fa06d25bf67",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-65DNXYKWWC",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Auth Service (this automatically registers the 'auth' component)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Analytics is optional and might fail in some environments (e.g., ad blockers)
let analytics = null;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics initialization failed:", e);
  }
}
export { analytics };