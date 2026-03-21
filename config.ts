/**
 * CareerReadyAI Configuration
 */

const getGeminiKey = () => {
  // Vite requires the VITE_ prefix to expose variables to the client-side code.
  // SECURITY NOTE: In a production environment, use a backend proxy to hide this key.
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

export const CONFIG = {
  GEMINI_API_KEY: getGeminiKey(),
  FORMSPREE_URL: import.meta.env.VITE_FORMSPREE_URL || '',
  IS_PRODUCTION: import.meta.env.PROD,
  STORAGE: {
    SESSION: window.sessionStorage,
    LOCAL: window.localStorage
  },
  STORAGE_KEYS: {
    USER: 'career_ready_user_session',
    ONBOARDING_TEMP: 'cr_onboarding_temp',
    FEEDBACK_PENDING: 'cr_feedback_pending',
    FEEDBACK_DRAFT: 'cr_feedback_draft'
  }
};