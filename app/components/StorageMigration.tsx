"use client";

import { useEffect } from "react";

/**
 * One-time migration from old "biro-ai:" localStorage keys to new "bezpapira:" keys.
 * Runs on first load. Copies data without deleting old keys (safe rollback).
 */
const LEGACY_KEYS_MAP: Record<string, string> = {
  "biro-ai:theme": "bezpapira:theme",
  "biro-ai:checks": "bezpapira:checks",
  "biro-ai:checkliste": "bezpapira:checkliste",
  "biro-ai:sessions": "bezpapira:sessions",
  "biro-ai:otvaranje-firme": "bezpapira:otvaranje-firme",
  "biro-ai:kupovina-stana": "bezpapira:kupovina-stana",
  "biro-ai:registracija-vozila": "bezpapira:registracija-vozila",
  "biro-ai:slobodan-razgovor": "bezpapira:slobodan-razgovor",
  "biro-ai:feedback": "bezpapira:feedback",
  "biro-ai:pwa-dismissed": "bezpapira:pwa-dismissed",
};

const MIGRATION_FLAG = "bezpapira:migrated";

export default function StorageMigration() {
  useEffect(() => {
    try {
      if (localStorage.getItem(MIGRATION_FLAG)) return;

      for (const [oldKey, newKey] of Object.entries(LEGACY_KEYS_MAP)) {
        const oldVal = localStorage.getItem(oldKey);
        if (oldVal && !localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, oldVal);
        }
      }

      // Also migrate active-session keys (dynamic prefix)
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("biro-ai:active-session:")) {
          const newKey = key.replace("biro-ai:", "bezpapira:");
          const val = localStorage.getItem(key);
          if (val && !localStorage.getItem(newKey)) {
            localStorage.setItem(newKey, val);
          }
        }
      }

      localStorage.setItem(MIGRATION_FLAG, "1");
    } catch {
      /* ignore — private browsing etc */
    }
  }, []);

  return null;
}
