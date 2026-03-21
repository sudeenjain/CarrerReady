/**
 * Security utilities for CareerReadyAI
 */

/**
 * Robust sanitization to prevent prompt injection.
 * Uses structural delimiters and filters common attack patterns.
 */
export const sanitizeAIInput = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove structural delimiters used by the system
    .replace(/\[\[DATA_BLOCK_START\]\]/gi, '')
    .replace(/\[\[DATA_BLOCK_END\]\]/gi, '')
    // Filter common injection keywords and phrases
    .replace(/ignore all (previous|prior) instructions/gi, '[REDACTED]')
    .replace(/systemInstruction/gi, '[REDACTED]')
    .replace(/disregard (the)? (above|below)/gi, '[REDACTED]')
    .replace(/you are now (a|an)/gi, '[REDACTED]')
    // Limit excessive length to prevent resource exhaustion attacks
    .substring(0, 10000);
};

/**
 * Wraps untrusted user data in secure structural delimiters.
 */
export const wrapUntrustedData = (data: string): string => {
  return `[[DATA_BLOCK_START]]\n${sanitizeAIInput(data)}\n[[DATA_BLOCK_END]]`;
};

/**
 * Escapes text for safe inclusion in LaTeX documents.
 */
export const escapeLaTeX = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/([&%$#_{}])/g, '\\$1')
    .replace(/\^/g, '\\textasciicircum{}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}')
    .replace(/\[/g, '{[}')
    .replace(/\]/g, '{]}');
};