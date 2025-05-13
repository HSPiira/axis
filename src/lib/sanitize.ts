/**
 * Sanitizes input string by removing potentially harmful characters
 * and trimming whitespace
 */
export function sanitizeInput(input: string): string {
    if (!input) return input;

    // Trim whitespace
    let sanitized = input.trim();

    // Remove HTML tags
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove SQL injection attempts
    sanitized = sanitized.replace(/['";]/g, '');

    return sanitized;
} 