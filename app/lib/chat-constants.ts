import type { Msg } from "./chat-utils";

/* ── Suggestion steps ─── */
export type SuggestionStep = {
  chips: string[];
  allowFreeText?: boolean;
};

export const SUGGESTION_STEPS: SuggestionStep[] = [
  // Step 0: City (after initial greeting)
  {
    chips: ["Beograd", "Novi Sad", "Niš", "Kragujevac", "Subotica"],
    allowFreeText: true,
  },
  // Step 1: Business type
  {
    chips: ["Preduzetnik", "DOO", "Još ne znam — objasni razliku"],
  },
  // Step 2: Activity
  {
    chips: ["IT / Programiranje", "Trgovina", "Ugostiteljstvo", "Konsalting", "Zanatstvo"],
    allowFreeText: true,
  },
  // Step 3: Taxation
  {
    chips: ["Da, paušalno", "Ne, vođenje knjiga", "Nisam siguran/a"],
  },
  // Step 4+: No suggestions (checklist is being generated)
];

/* ── LocalStorage keys ─── */
export const STORAGE_KEY = "bezpapira:otvaranje-firme";
export const CHECKLISTS_KEY = "bezpapira:checkliste";

/* ── Initial state ─── */
export const INITIAL_MESSAGES: Msg[] = [
  {
    role: "ai",
    text: "Ćao! 👋 Hajde da zajedno prođemo kroz proces otvaranja firme. Za početak — **u kom gradu** planiraš da otvoriš firmu?",
  },
];

/* ── Saved checklist type ─── */
export type SavedChecklist = {
  id: string;
  date: string;
  params: { grad?: string; tip?: string; delatnost?: string; oporezivanje?: string };
  markdown: string;
};

/* ── Timeout ─── */
export const REQUEST_TIMEOUT_MS = 30_000;
