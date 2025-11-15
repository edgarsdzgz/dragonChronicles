/**
 * Dialogue System Schemas
 *
 * Zod schemas for validating dialogue data structures.
 * Supports both linear dialogues (cutscenes) and branching dialogues (NPC conversations).
 *
 * All text content is stored as translation keys that reference the locales files.
 *
 * @module dialogue/schemas
 */

import { z } from 'zod';

/**
 * Metadata for dialogue sequences
 */
export const DialogueMetadataSchema = z.object({
  title: z.string().optional(),
  titleKey: z.string().optional(), // Translation key for title
  description: z.string().optional(),
  descriptionKey: z.string().optional(), // Translation key for description
  author: z.string().optional(),
  version: z.string().optional(),
});

export type DialogueMetadata = z.infer<typeof DialogueMetadataSchema>;

/**
 * Screen in a linear dialogue sequence
 * Used for cutscenes that play sequentially
 */
export const DialogueScreenSchema = z.object({
  id: z.string(),
  textKey: z.string(), // Translation key (e.g., "dialogues:opening.screen1")
  speaker: z.string().nullable().optional(), // Speaker name (null for narration)
  speakerKey: z.string().optional(), // Translation key for speaker name
  portrait: z.string().optional(), // Portrait image path (future use)
  variables: z.array(z.string()).optional(), // Variables for interpolation (e.g., ["dragonName"])
  duration: z.number().optional(), // Auto-advance after duration (ms), null = wait for input
});

export type DialogueScreen = z.infer<typeof DialogueScreenSchema>;

/**
 * Linear dialogue sequence
 * Screens play one after another in order
 * Used for: opening cutscene, story moments, linear tutorials
 */
export const LinearDialogueSchema = z.object({
  id: z.string(),
  type: z.literal('linear'),
  metadata: DialogueMetadataSchema.optional(),
  screens: z.array(DialogueScreenSchema).min(1),
});

export type LinearDialogue = z.infer<typeof LinearDialogueSchema>;

/**
 * Text node in a branching dialogue tree
 * Displays text from an NPC or narrator
 */
export const DialogueTextNodeSchema = z.object({
  id: z.string(),
  type: z.literal('text'),
  textKey: z.string(), // Translation key for the dialogue text
  speaker: z.string().nullable().optional(), // Speaker name (null for narrator)
  speakerKey: z.string().optional(), // Translation key for speaker name
  portrait: z.string().optional(), // Portrait image path
  emotion: z.string().optional(), // Emotion for portrait (happy, sad, angry, etc.)
  next: z.string().nullable(), // Next node ID, or null to end dialogue
});

export type DialogueTextNode = z.infer<typeof DialogueTextNodeSchema>;

/**
 * Condition for showing a choice
 * Checks game state before displaying the choice
 */
export const ChoiceConditionSchema = z.object({
  // Currency requirements
  arcana: z.object({ gte: z.number() }).optional(),
  gold: z.object({ gte: z.number() }).optional(),
  soulPower: z.object({ gte: z.number() }).optional(),

  // Item requirements
  hasItem: z.string().optional(),
  hasItemCount: z.object({ itemId: z.string(), count: z.number() }).optional(),

  // Quest/story flags
  questComplete: z.string().optional(),
  storyFlag: z.string().optional(),
  storyFlagValue: z
    .object({ flag: z.string(), value: z.union([z.string(), z.number(), z.boolean()]) })
    .optional(),

  // Stats
  level: z.object({ gte: z.number() }).optional(),

  // Custom conditions (evaluated by game logic)
  custom: z.string().optional(),
});

export type ChoiceCondition = z.infer<typeof ChoiceConditionSchema>;

/**
 * Player choice in a branching dialogue
 */
export const DialogueChoiceSchema = z.object({
  id: z.string().optional(),
  textKey: z.string(), // Translation key for choice text
  next: z.string().nullable(), // Next node ID, or null to end dialogue
  condition: ChoiceConditionSchema.optional(), // Condition to show this choice
  cost: z
    .object({
      arcana: z.number().optional(),
      gold: z.number().optional(),
      items: z.array(z.object({ id: z.string(), count: z.number() })).optional(),
    })
    .optional(), // Cost to select this choice
});

export type DialogueChoice = z.infer<typeof DialogueChoiceSchema>;

/**
 * Choice node in a branching dialogue tree
 * Presents options to the player
 */
export const DialogueChoiceNodeSchema = z.object({
  id: z.string(),
  type: z.literal('choice'),
  choices: z.array(DialogueChoiceSchema).min(1),
  timeLimit: z.number().optional(), // Time limit for choice (ms), null = no limit
});

export type DialogueChoiceNode = z.infer<typeof DialogueChoiceNodeSchema>;

/**
 * Union of all node types
 */
export const DialogueNodeSchema = z.union([DialogueTextNodeSchema, DialogueChoiceNodeSchema]);

export type DialogueNode = z.infer<typeof DialogueNodeSchema>;

/**
 * Branching dialogue tree
 * Player choices affect dialogue flow
 * Used for: NPC conversations, quest dialogues, meaningful choices
 */
export const BranchingDialogueSchema = z.object({
  id: z.string(),
  type: z.literal('branching'),
  metadata: DialogueMetadataSchema.optional(),
  startNode: z.string(), // ID of the first node to display
  nodes: z.record(z.string(), DialogueNodeSchema), // Map of node ID to node data
});

export type BranchingDialogue = z.infer<typeof BranchingDialogueSchema>;

/**
 * Union of all dialogue types
 */
export const DialogueSchema = z.union([LinearDialogueSchema, BranchingDialogueSchema]);

export type Dialogue = z.infer<typeof DialogueSchema>;

/**
 * Dialogue display options
 * Configures how dialogue is rendered and behaves
 */
export const DialogueOptionsSchema = z.object({
  // Variable substitution for text interpolation
  variables: z.record(z.string(), z.union([z.string(), z.number()])).optional(),

  // Skip settings
  allowSkip: z.boolean().optional(), // Allow ESC to skip
  skipConfirmation: z.boolean().optional(), // Show confirmation dialog before skipping

  // Auto-advance settings
  autoAdvance: z.boolean().optional(), // Auto-advance after duration
  autoAdvanceDuration: z.number().optional(), // Default duration for auto-advance (ms)

  // Animation settings
  typewriterSpeed: z.number().optional(), // Characters per second for typewriter
  fadeSpeed: z.number().optional(), // Fade transition speed (ms)

  // Callbacks (validated at TypeScript level, not runtime)
  // onComplete: z.function().optional(), // Called when dialogue ends
  // onChoiceSelected: z.function().optional(), // Called when choice selected
  // onScreenChange: z.function().optional(), // Called when screen changes
});

export type DialogueOptions = z.infer<typeof DialogueOptionsSchema>;

/**
 * Dialogue state for managing dialogue playback
 */
export interface DialogueState {
  currentScreenIndex?: number | undefined; // For linear dialogues
  currentNodeId?: string | undefined; // For branching dialogues
  visitedNodes?: Set<string> | undefined; // Track visited nodes (for branching)
  isAnimating: boolean; // Currently animating text
  isPaused: boolean; // Dialogue is paused
  isComplete: boolean; // Dialogue has ended
  variables: Record<string, string | number>; // Current variable values
}

/**
 * Validate dialogue data
 * Throws error if validation fails
 *
 * @param data - Raw dialogue data to validate
 * @returns Validated dialogue object
 */
export function validateDialogue(data: unknown): Dialogue {
  return DialogueSchema.parse(data);
}

/**
 * Type guard for linear dialogue
 */
export function isLinearDialogue(dialogue: Dialogue): dialogue is LinearDialogue {
  return dialogue.type === 'linear';
}

/**
 * Type guard for branching dialogue
 */
export function isBranchingDialogue(dialogue: Dialogue): dialogue is BranchingDialogue {
  return dialogue.type === 'branching';
}

/**
 * Type guard for text node
 */
export function isTextNode(node: DialogueNode): node is DialogueTextNode {
  return node.type === 'text';
}

/**
 * Type guard for choice node
 */
export function isChoiceNode(node: DialogueNode): node is DialogueChoiceNode {
  return node.type === 'choice';
}
