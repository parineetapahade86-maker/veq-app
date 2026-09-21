// lib/sanitizeData.ts
export function sanitizeForAI(text: string): string {
    if (!text) return text;
    let sanitized = text;

    // 1. Redact email addresses
    sanitized = sanitized.replace(/\S+@\S+\.\S+/g, '[EMAIL_REDACTED]');

    // 2. Redact credit card numbers
    sanitized = sanitized.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD_REDACTED]');

    // 3. Redact passwords, API keys, and tokens (pattern matching)
    // This catches patterns like "password: 12345" or "API_KEY=xyz"
    sanitized = sanitized.replace(
        /(password|pass|pwd|secret|api[_-]?key|token|auth)\s*[:=]\s*\S+/gi,
        '$1: [SECRET_REDACTED]'
    );

    // 4. Redact phone numbers (Indian format + general)
    sanitized = sanitized.replace(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[PHONE_REDACTED]');

    return sanitized;
}