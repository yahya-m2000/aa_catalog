import en from './en.json';

type TranslationDictionary = typeof en;

function getNestedValue(dictionary: unknown, path: string): string {
  const value = path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, dictionary);

  if (typeof value !== 'string') {
    console.warn(`[i18n] Missing translation key: "${path}"`);
    return path;
  }

  return value;
}

export function t(key: string): string {
  return getNestedValue(en, key);
}

export type { TranslationDictionary };
