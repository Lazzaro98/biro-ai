import type { Msg } from "../chat-utils";

/** Suggestion step config — chips shown to user at each stage */
export type SuggestionStep = {
  chips: string[];
  allowFreeText?: boolean;
};

/** Saved checklist entry in localStorage */
export type SavedChecklist = {
  id: string;
  date: string;
  flowId: string;
  params: Record<string, string | undefined>;
  markdown: string;
};

/** Complete configuration for a single chat flow */
export interface FlowConfig {
  /** Unique identifier, used in URL path (e.g. "otvaranje-firme") */
  id: string;

  /** Display title (e.g. "Otvaranje firme") */
  title: string;

  /** Short description for cards/meta */
  description: string;

  /** Emoji icon */
  icon: string;

  /** Estimated completion time */
  estimatedTime: string;

  /** Tip shown on start page */
  startPageTip: string;

  /** Factory function returning the system prompt (fresh date per request) */
  buildSystemPrompt: () => string;

  /** Suggestion chips for each step */
  suggestionSteps: SuggestionStep[];

  /** First message(s) the AI shows */
  initialMessages: Msg[];

  /** localStorage key for chat messages */
  storageKey: string;

  /** localStorage key for saved checklists */
  checklistsKey: string;

  /** Detect which step the conversation is on */
  detectStep: (msgs: Msg[]) => number;

  /** Check if a message is the final checklist */
  isChecklist: (text: string) => boolean;

  /** Extract user parameters from messages for checklist saving */
  extractParams: (msgs: Msg[]) => Record<string, string | undefined>;
}
