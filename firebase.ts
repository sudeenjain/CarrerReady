import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Prefer env vars (VITE_FIREBASE_* or FIREBASE_* in .env) for production; fallback for local dev
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD636K3W5TQH-3SpdqHmmf_oJ4NLayyPhY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "careersnap-1ab4f.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "careersnap-1ab4f",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "careersnap-1ab4f.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1008016030460",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1008016030460:web:b7ecc6a6a6b48588bd3579",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-G50EN9GW0M",
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