/**
 * Dialogue Loader
 *
 * Loads and validates dialogue data from JSON files.
 * Integrates with i18next for text translation.
 *
 * Features:
 * - Load dialogue files from /static/dialogues/
 * - Validate with Zod schemas
 * - Cache loaded dialogues
 * - Text translation via i18next
 * - Variable substitution
 * - Error handling with fallbacks
 *
 * @module dialogue/loader
 */

import { validateDialogue, type Dialogue } from './schemas';
import { t } from '$lib/i18n/helpers';

/**
 * DialogueLoader
 *
 * Handles loading and caching dialogue data.
 *
 * @example
 * ```typescript
 * const loader = new DialogueLoader();
 * const dialogue = await loader.load('opening-cutscene');
 *
 * // Get translated text for a screen
 * const text = loader.getTranslatedText('dialogues:opening.screen1', { dragonName: 'Flameheart' });
 * ```
 */
export class DialogueLoader {
  private cache: Map<string, Dialogue> = new Map();
  private loadingPromises: Map<string, Promise<Dialogue>> = new Map();

  /**
   * Load dialogue from JSON file
   *
   * @param dialogueId - ID of the dialogue file (without .json extension)
   * @returns Promise resolving to validated Dialogue object
   * @throws Error if file not found or validation fails
   */
  async load(dialogueId: string): Promise<Dialogue> {
    // Check cache first
    if (this.cache.has(dialogueId)) {
      return this.cache.get(dialogueId)!;
    }

    // Check if already loading
    if (this.loadingPromises.has(dialogueId)) {
      return this.loadingPromises.get(dialogueId)!;
    }

    // Start loading
    const loadingPromise = this.loadInternal(dialogueId);
    this.loadingPromises.set(dialogueId, loadingPromise);

    try {
      const dialogue = await loadingPromise;
      this.cache.set(dialogueId, dialogue);
      return dialogue;
    } finally {
      this.loadingPromises.delete(dialogueId);
    }
  }

  /**
   * Internal loading logic
   */
  private async loadInternal(dialogueId: string): Promise<Dialogue> {
    const path = `/dialogues/${dialogueId}.json`;

    try {
      console.log(`[DialogueLoader] Loading dialogue: ${path}`);

      const response = await fetch(path);

      if (!response.ok) {
        throw new Error(`Failed to load dialogue: ${response.statusText}`);
      }

      const rawData = await response.json();

      // Validate with Zod
      const dialogue = validateDialogue(rawData);

      console.log(`[DialogueLoader] Successfully loaded dialogue: ${dialogueId}`);
      return dialogue;
    } catch (error) {
      console.error(`[DialogueLoader] Error loading dialogue "${dialogueId}":`, error);
      throw error;
    }
  }

  /**
   * Get translated text for a translation key
   *
   * @param textKey - Translation key (e.g., "dialogues:opening.screen1")
   * @param variables - Variables for interpolation
   * @returns Translated and interpolated text
   */
  getTranslatedText(textKey: string, variables?: Record<string, string | number>): string {
    return t(textKey, variables);
  }

  /**
   * Preload multiple dialogues
   * Useful for reducing loading times during gameplay
   *
   * @param dialogueIds - Array of dialogue IDs to preload
   * @returns Promise that resolves when all dialogues are loaded
   */
  async preload(dialogueIds: string[]): Promise<void> {
    console.log(`[DialogueLoader] Preloading ${dialogueIds.length} dialogues...`);

    const promises = dialogueIds.map((id) =>
      this.load(id).catch((error) => {
        console.warn(`[DialogueLoader] Failed to preload dialogue "${id}":`, error);
      }),
    );

    await Promise.all(promises);

    console.log(`[DialogueLoader] Preloading complete`);
  }

  /**
   * Check if dialogue is cached
   *
   * @param dialogueId - Dialogue ID to check
   * @returns True if dialogue is in cache
   */
  isCached(dialogueId: string): boolean {
    return this.cache.has(dialogueId);
  }

  /**
   * Clear a specific dialogue from cache
   *
   * @param dialogueId - Dialogue ID to clear
   */
  clearCache(dialogueId: string): void {
    this.cache.delete(dialogueId);
    console.log(`[DialogueLoader] Cleared cache for: ${dialogueId}`);
  }

  /**
   * Clear all cached dialogues
   * Useful for development hot-reload
   */
  clearAllCache(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`[DialogueLoader] Cleared all cache (${count} dialogues)`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cached: number; loading: number } {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
    };
  }

  /**
   * Reload a dialogue (clears cache and loads fresh)
   *
   * @param dialogueId - Dialogue ID to reload
   * @returns Promise resolving to reloaded Dialogue
   */
  async reload(dialogueId: string): Promise<Dialogue> {
    this.clearCache(dialogueId);
    return this.load(dialogueId);
  }
}

/**
 * Global dialogue loader instance
 * Singleton pattern for shared cache across the application
 */
let globalLoader: DialogueLoader | null = null;

/**
 * Get the global dialogue loader instance
 * Creates it if it doesn't exist
 *
 * @returns Global DialogueLoader instance
 */
export function getDialogueLoader(): DialogueLoader {
  if (!globalLoader) {
    globalLoader = new DialogueLoader();
  }
  return globalLoader;
}

/**
 * Reset the global dialogue loader
 * Useful for testing or development
 */
export function resetDialogueLoader(): void {
  if (globalLoader) {
    globalLoader.clearAllCache();
  }
  globalLoader = null;
}
