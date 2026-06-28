const REFERENCE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const REFERENCE_SUFFIX_LENGTH = 4;

function randomSuffix(): string {
  let suffix = '';
  for (let i = 0; i < REFERENCE_SUFFIX_LENGTH; i++) {
    suffix += REFERENCE_CHARS[Math.floor(Math.random() * REFERENCE_CHARS.length)];
  }
  return suffix;
}

export function generateOrderReference(date: Date = new Date()): string {
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  return `ORD-${datePart}-${randomSuffix()}`;
}
