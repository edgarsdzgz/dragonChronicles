/**
 * Translation Helper Utilities
 *
 * Provides convenient wrapper functions for i18next translation.
 * Use these helpers throughout the codebase instead of calling i18next directly.
 *
 * @module i18n/helpers
 */

import { getI18nInstance, isI18nInitialized } from './config';

/**
 * Translation options for interpolation and context
 */
export interface TranslationOptions {
  /** Variables for interpolation (e.g., {dragonName: 'Flameheart'}) */
  [key: string]: string | number | boolean | undefined;
  /** Count for pluralization */
  count?: number | undefined;
  /** Context for conditional translations */
  context?: string | undefined;
  /** Default value if translation key not found */
  defaultValue?: string | undefined;
}

/**
 * Main translation function
 *
 * @param key - Translation key in format 'namespace:path.to.key' or 'path.to.key' (uses default namespace)
 * @param options - Interpolation variables and options
 * @returns Translated string
 *
 * @example
 * ```typescript
 * // Simple translation
 * const yes = t('common:yes'); // "Yes"
 *
 * // With interpolation
 * const greeting = t('dialogues:opening.screen1', { dragonName: 'Flameheart' });
 *
 * // With pluralization
 * const items = t('ui:inventory.itemCount', { count: 5 }); // "5 items"
 *
 * // With default value
 * const fallback = t('missing:key', { defaultValue: 'Fallback text' });
 * ```
 */
export function t(key: string, options?: TranslationOptions): string {
  if (!isI18nInitialized()) {
    console.warn('[i18n] Translation requested before initialization:', key);
    return options?.defaultValue || key;
  }

  const i18n = getI18nInstance();

  try {
    const translated = i18n.t(key, options);

    // In development, warn about missing translations
    if (import.meta.env.DEV && translated === key) {
      console.warn(`[i18n] Missing translation key: ${key}`);
    }

    return translated as string;
  } catch (error) {
    console.error(`[i18n] Error translating key "${key}":`, error);
    return options?.defaultValue || key;
  }
}

/**
 * Check if a translation key exists
 *
 * @param key - Translation key to check
 * @param options - Optional language and namespace to check
 * @returns True if the translation exists
 */
export function exists(key: string, options?: { lng?: string; ns?: string }): boolean {
  if (!isI18nInitialized()) {
    return false;
  }

  const i18n = getI18nInstance();
  return i18n.exists(key, options);
}

/**
 * Translate with explicit namespace
 * Useful when you want to be explicit about the namespace
 *
 * @param namespace - Namespace to use
 * @param key - Translation key within the namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const title = tn('ui', 'profiles.selectProfile'); // Same as t('ui:profiles.selectProfile')
 * ```
 */
export function tn(namespace: string, key: string, options?: TranslationOptions): string {
  return t(`${namespace}:${key}`, options);
}

/**
 * Translate common namespace shorthand
 *
 * @param key - Key within common namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const yes = tc('yes'); // "Yes"
 * const no = tc('no'); // "No"
 * ```
 */
export function tc(key: string, options?: TranslationOptions): string {
  return t(`common:${key}`, options);
}

/**
 * Translate UI namespace shorthand
 *
 * @param key - Key within ui namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const title = tu('profiles.selectProfile'); // "Select a Profile"
 * ```
 */
export function tu(key: string, options?: TranslationOptions): string {
  return t(`ui:${key}`, options);
}

/**
 * Translate dialogues namespace shorthand
 *
 * @param key - Key within dialogues namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const text = td('opening.screen1', { dragonName: 'Flameheart' });
 * ```
 */
export function td(key: string, options?: TranslationOptions): string {
  return t(`dialogues:${key}`, options);
}

/**
 * Translate buildings namespace shorthand
 *
 * @param key - Key within buildings namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const name = tb('academy.library'); // "Ancient Library"
 * ```
 */
export function tb(key: string, options?: TranslationOptions): string {
  return t(`buildings:${key}`, options);
}

/**
 * Translate NPCs namespace shorthand
 *
 * @param key - Key within npcs namespace
 * @param options - Interpolation variables
 * @returns Translated string
 *
 * @example
 * ```typescript
 * const name = tnpc('elderSaphyrian.name'); // "Elder Saphyrian"
 * ```
 */
export function tnpc(key: string, options?: TranslationOptions): string {
  return t(`npcs:${key}`, options);
}

/**
 * Get multiple translations at once
 * Useful for pre-loading translations for UI components
 *
 * @param keys - Array of translation keys
 * @param options - Shared interpolation variables
 * @returns Object mapping keys to translated strings
 *
 * @example
 * ```typescript
 * const { yes, no, cancel } = getMany(['common:yes', 'common:no', 'common:cancel']);
 * ```
 */
export function getMany(keys: string[], options?: TranslationOptions): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of keys) {
    // Use last part of key as object key
    const objKey = key.includes(':') ? key.split(':')[1] : key;
    result[objKey] = t(key, options);
  }

  return result;
}

/**
 * Replace variables in a string template
 * Used internally for dialogue variable substitution
 *
 * @param template - String with {{variable}} placeholders
 * @param variables - Object with variable values
 * @returns String with variables replaced
 *
 * @example
 * ```typescript
 * const text = interpolate('Hello {{name}}!', { name: 'Dragon' }); // "Hello Dragon!"
 * ```
 */
export function interpolate(template: string, variables: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(variables[key] ?? `{{${key}}}`);
  });
}

/**
 * Format a number according to current locale
 *
 * @param value - Number to format
 * @param options - Intl.NumberFormat options
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * const gold = formatNumber(1000); // "1,000" (en) or "1 000" (fr)
 * const percent = formatNumber(0.85, { style: 'percent' }); // "85%"
 * ```
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
  if (!isI18nInitialized()) {
    return String(value);
  }

  const i18n = getI18nInstance();
  const locale = i18n.language || 'en';

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch (error) {
    console.error('[i18n] Error formatting number:', error);
    return String(value);
  }
}

/**
 * Format a date according to current locale
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * const dateStr = formatDate(new Date(), { dateStyle: 'medium' }); // "Jan 15, 2025" (en)
 * ```
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  if (!isI18nInitialized()) {
    return date.toLocaleDateString();
  }

  const i18n = getI18nInstance();
  const locale = i18n.language || 'en';

  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.error('[i18n] Error formatting date:', error);
    return date.toLocaleDateString();
  }
}
