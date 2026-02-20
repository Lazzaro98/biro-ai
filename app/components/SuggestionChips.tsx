"use client";

import { memo } from "react";
import type { SuggestionStep } from "../lib/chat-constants";

interface SuggestionChipsProps {
  suggestions: SuggestionStep;
  onSelect: (text: string) => void;
}

export const SuggestionChips = memo(function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <div className="no-print flex gap-3 animate-msg-in">
      {/* Align with AI bubble (offset by avatar width) */}
      <div className="w-8 shrink-0" />
      <div className="flex flex-wrap gap-2" role="group" aria-label="Predloženi odgovori">
        {suggestions.chips.map((chip, idx) => (
          <button
            key={chip}
            type="button"
            onClick={() => onSelect(chip)}
            className="animate-chip-in inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-card-bg backdrop-blur-sm
                       px-4 py-2.5 text-sm font-medium text-primary shadow-sm
                       hover:bg-primary hover:text-white hover:border-primary hover:shadow-md hover:shadow-primary/20
                       active:scale-95 transition-all duration-200 cursor-pointer"
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            {chip}
          </button>
        ))}
      </div>
    </div>
  );
});
