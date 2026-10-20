// RFC 5322 Compliant Email Regex
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Parses raw text containing emails:
 * 1. Smart TLD auto-split (e.g., .combob@gmail.com -> .com\nbob@gmail.com)
 * 2. Splits on newlines, commas, semicolons, tabs, and spaces
 * 3. Trims, lowercases, and validates via RFC-compliant regex
 * 4. Deduplicates and separates into valid vs malformed lists
 */
export const parseAndValidateEmailInput = (rawText) => {
  if (!rawText || !rawText.trim()) {
    return { valid: [], invalid: [], totalCount: 0 };
  }

  // 1. Smart TLD auto-split when domain is immediately glued to another address
  const preProcessed = rawText.replace(
    /(\.(?:com|org|edu|in|net|gov|io|co|ac|me|info|biz))([a-zA-Z0-9._%+-]+@)/gi,
    (match, g1, g2) => `${g1}\n${g2}`
  );

  // 2. Split on newlines, commas, semicolons, tabs, and spaces
  const tokens = preProcessed.split(/[\r\n,;\s]+/);

  const validSet = new Set();
  const invalidSet = new Set();

  tokens.forEach((token) => {
    const cleaned = token.trim().toLowerCase();
    if (!cleaned) return;

    if (EMAIL_REGEX.test(cleaned)) {
      validSet.add(cleaned);
    } else {
      invalidSet.add(cleaned);
    }
  });

  const valid = Array.from(validSet);
  const invalid = Array.from(invalidSet);

  return {
    valid,
    invalid,
    totalCount: valid.length
  };
};
