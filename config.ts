/**
 * CareerReadyAI Configuration
 * 
 * SECURITY FIX: 
 * 1. The Gemini API Key is now accessed via a non-prefixed variable to prevent Vite bundling.
 * 2. Sensitive storage has been moved to sessionStorage.
 * 3. Third-party endpoints are externalized.
 */

const getGeminiKey = () => {
  // Non-prefixed keys are NOT bundled by Vite, making them safe for server-side/proxy use.
  return import.meta.env.GEMINI_API_KEY || '';
};

export const CONFIG = {
  GEMINI_API_KEY: getGeminiKey(),
  // Removed hardcoded fallback to prevent exposure of the Formspree ID in source code.
  FORMSPREE_URL: import.meta.env.VITE_FORMSPREE_URL || '',
  IS_PRODUCTION: import.meta.env.PROD,
  STORAGE: {
    // Use sessionStorage for sensitive profile data and drafts to prevent persistent XSS theft
    SESSION: window.sessionStorage,
    // Use localStorage only for non-sensitive UI state or reliability outboxes
    LOCAL: window.localStorage
  },
  STORAGE_KEYS: {
    USER: 'career_ready_user_session',
    ONBOARDING_TEMP: 'cr_onboarding_temp',
    FEEDBACK_PENDING: 'cr_feedback_pending',
    FEEDBACK_DRAFT: 'cr_feedback_draft'
  }
};