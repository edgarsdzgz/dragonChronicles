/**
 * i18next Configuration for Draconia Chronicles
 *
 * Provides internationalization support for all game text including:
 * - Dialogue content (cutscenes, NPC conversations)
 * - UI text (buttons, labels, menus)
 * - Building and item names
 * - Game notifications and tooltips
 *
 * Translation files are organized by namespace in /static/locales/
 * Following pattern: locales/{{lng}}/{{ns}}.json
 *
 * @module i18n/config
 */

import i18next from 'i18next';

/**
 * Available namespaces for organizing translations
 */
export const NAMESPACES = {
  COMMON: 'common', // Shared text (Yes, No, Cancel, etc.)
  UI: 'ui', // UI elements, buttons, labels
  DIALOGUES: 'dialogues', // All dialogue content
  BUILDINGS: 'buildings', // Building names and descriptions
  ITEMS: 'items', // Item names and descriptions
  NPCS: 'npcs', // NPC names, titles, roles
} as const;

/**
 * Supported languages
 * More languages can be added as translations become available
 */
export const SUPPORTED_LANGUAGES = {
  EN: 'en', // English (default)
  ES: 'es', // Spanish (future)
  FR: 'fr', // French (future)
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];
export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];

/**
 * i18next instance singleton
 */
let isInitialized = false;

/**
 * Initialize i18next with configuration
 * Should be called once during app initialization
 *
 * @param language - Initial language (defaults to 'en')
 * @returns Promise that resolves when i18next is ready
 */
export async function initI18n(
  language: SupportedLanguage = SUPPORTED_LANGUAGES.EN,
): Promise<void> {
  if (isInitialized) {
    console.warn('[i18n] Already initialized, skipping...');
    return;
  }

  // Load translation resources from static files
  const resources: Record<string, Record<string, unknown>> = {};

  // Load English translations (required)
  resources[SUPPORTED_LANGUAGES.EN] = {};
  for (const ns of Object.values(NAMESPACES)) {
    try {
      const response = await fetch(`/locales/${SUPPORTED_LANGUAGES.EN}/${ns}.json`);
      if (response.ok) {
        resources[SUPPORTED_LANGUAGES.EN][ns] = await response.json();
      } else {
        console.warn(`[i18n] Failed to load namespace: ${ns}`);
      }
    } catch (error) {
      console.error(`[i18n] Error loading namespace ${ns}:`, error);
    }
  }

  await i18next.init({
    lng: language,
    fallbackLng: SUPPORTED_LANGUAGES.EN,
    ns: Object.values(NAMESPACES),
    defaultNS: NAMESPACES.UI,

    // Load translation resources
    resources,

    // Enable debug mode in development
    debug: import.meta.env.DEV,

    // Interpolation settings
    interpolation: {
      escapeValue: false, // Svelte/React handles escaping
      prefix: '{{',
      suffix: '}}',
    },

    // Key separator for nested translations
    keySeparator: '.',

    // Namespace separator
    nsSeparator: ':',

    // Return key if translation is missing (in dev mode)
    returnEmptyString: false,
    returnNull: false,

    // Misc settings
    load: 'currentOnly', // Only load current language
    preload: [SUPPORTED_LANGUAGES.EN], // Always preload English
  });

  isInitialized = true;
  console.log(`[i18n] Initialized with language: ${language}`);
}

/**
 * Change the current language
 * Loads new translation files if not already loaded
 *
 * @param language - Language code to switch to
 */
export async function changeLanguage(language: SupportedLanguage): Promise<void> {
  if (!isInitialized) {
    throw new Error('[i18n] Not initialized. Call initI18n() first.');
  }

  // Check if language is already loaded
  if (i18next.hasResourceBundle(language, NAMESPACES.UI)) {
    await i18next.changeLanguage(language);
    console.log(`[i18n] Changed language to: ${language}`);
    return;
  }

  // Load translation files for new language
  console.log(`[i18n] Loading translations for: ${language}`);

  for (const ns of Object.values(NAMESPACES)) {
    try {
      const response = await fetch(`/locales/${language}/${ns}.json`);
      if (response.ok) {
        const translations = await response.json();
        i18next.addResourceBundle(language, ns, translations, true, true);
      } else {
        console.warn(`[i18n] Translation file not found: ${language}/${ns}.json`);
      }
    } catch (error) {
      console.error(`[i18n] Error loading ${language}/${ns}.json:`, error);
    }
  }

  await i18next.changeLanguage(language);
  console.log(`[i18n] Changed language to: ${language}`);
}

/**
 * Get current language
 */
export function getCurrentLanguage(): string {
  return i18next.language || SUPPORTED_LANGUAGES.EN;
}

/**
 * Get the raw i18next instance
 * Use with caution - prefer using helpers from ./helpers.ts
 */
export function getI18nInstance() {
  return i18next;
}

/**
 * Check if i18n is initialized
 */
export function isI18nInitialized(): boolean {
  return isInitialized;
}
