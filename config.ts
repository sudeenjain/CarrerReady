/**
 * CareerReadyAI Configuration
 * 
 * SECURITY WARNING: 
 * The Gemini API Key is currently accessed via VITE_ environment variables.
 * In a production environment, this key should be moved to a backend proxy
 * to prevent exposure to the client-side bundle.
 */

export const CONFIG = {
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
  IS_PRODUCTION: import.meta.env.PROD,
  STORAGE_KEYS: {
    USER: 'career_ready_user',
    ONBOARDING_TEMP: 'cr_onboarding_temp',
    FEEDBACK_PENDING: 'cr_feedback_pending',
    FEEDBACK_DRAFT: 'cr_feedback_draft'
  }
};

if (!CONFIG.GEMINI_API_KEY && !import.meta.env.SSR) {
  console.warn("Security Alert: VITE_GEMINI_API_KEY is missing. AI features will be disabled.");
}