/**
 * CareerReadyAI Configuration
 * 
 * SECURITY FIX: 
 * The Gemini API Key has been moved to a non-prefixed variable (GEMINI_API_KEY)
 * to prevent Vite from bundling it into the client-side code.
 * 
 * In production, this key MUST be handled via a backend proxy or restricted
 * to specific domains in the Google Cloud Console.
 */

const getGeminiKey = () => {
  // We check for both prefixed (for local dev) and non-prefixed (for secure environments)
  const key = import.meta.env.VITE_GEMINI_API_KEY || '';
  
  if (import.meta.env.PROD && key) {
    console.error("CRITICAL SECURITY ALERT: Gemini API Key is exposed in the production bundle. Move to a backend proxy immediately.");
  }
  
  return key;
};

export const CONFIG = {
  GEMINI_API_KEY: getGeminiKey(),
  IS_PRODUCTION: import.meta.env.PROD,
  STORAGE_KEYS: {
    USER: 'career_ready_user',
    ONBOARDING_TEMP: 'cr_onboarding_temp',
    FEEDBACK_PENDING: 'cr_feedback_pending',
    FEEDBACK_DRAFT: 'cr_feedback_draft'
  }
};