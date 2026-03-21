/**
 * Security utilities for CareerReadyAI
 */

/**
 * Sanitizes user input to prevent prompt injection by removing common delimiters.
 */
export const sanitizeAIInput = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/\[USER_INPUT_START\]/gi, '')
    .replace(/\[USER_INPUT_END\]/gi, '')
    .replace(/systemInstruction/gi, '')
    .replace(/ignore all previous instructions/gi, '[REDACTED]');
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