"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHECKS_KEY = "biro-ai:checks";

type CheckState = Record<string, boolean>;

function loadChecks(): CheckState {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CHECKS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveChecks(state: CheckState) {
  try {
    localStorage.setItem(CHECKS_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

/** A parsed segment: either markdown text or a checklist item */
type Segment =
  | { type: "md"; content: string }
  | { type: "task"; lineIndex: number; label: string };

/**
 * Split the markdown into segments.
 * Consecutive non-task lines become one "md" segment.
 * Each `- [ ]` or `- [x]` line becomes a "task" segment.
 */
function parseSegments(md: string): Segment[] {
  const lines = md.split("\n");
  const segments: Segment[] = [];
  let mdBuffer: string[] = [];

  const flushMd = () => {
    if (mdBuffer.length > 0) {
      segments.push({ type: "md", content: mdBuffer.join("\n") });
      mdBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const taskMatch = lines[i].match(/^(\s*)- \[[ xX]\]\s*(.*)$/);
    if (taskMatch) {
      flushMd();
      segments.push({ type: "task", lineIndex: i, label: taskMatch[2] });
    } else {
      mdBuffer.push(lines[i]);
    }
  }
  flushMd();

  return segments;
}

function countTasks(segments: Segment[]): number {
  return segments.filter((s) => s.type === "task").length;
}

type Props = {
  checklistId: string;
  markdown: string;
  showProgress?: boolean;
};

export default function ChecklistRenderer({ checklistId, markdown, showProgress = true }: Props) {
  const [checks, setChecks] = useState<CheckState>(loadChecks);

  useEffect(() => {
    setChecks(loadChecks());
  }, []);

  const toggle = useCallback((key: string) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      saveChecks(next);
      return next;
    });
  }, []);

  const segments = useMemo(() => parseSegments(markdown), [markdown]);
  const total = countTasks(segments);
  const checked = segments.filter(
    (s) => s.type === "task" && checks[`${checklistId}:${s.lineIndex}`],
  ).length;
  const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

  return (
    <div>
      {/* Progress bar */}
      {showProgress && total > 0 && (
        <div className="mb-4 rounded-xl bg-surface-alt border border-border-light p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground" id={`progress-label-${checklistId}`}>Progres</span>
            <span className="text-sm font-semibold text-primary" aria-live="polite">
              {checked}/{total} {pct === 100 && "🎉"}
            </span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-border overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-labelledby={`progress-label-${checklistId}`}
          >
            <div
              className={[
                "h-full rounded-full transition-all duration-500 ease-out",
                pct === 100 ? "bg-emerald-500" : "bg-primary",
              ].join(" ")}
              style={{ width: `${pct}%` }}
            />
          </div>
          {pct === 100 && (
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Svaka čast! Završio/la si sve korake! 🎉
            </p>
          )}
        </div>
      )}

      {/* Render segments */}
      <div className="prose-chat max-w-none" role="group" aria-label="Stavke checkliste">
        {segments.map((seg, i) => {
          if (seg.type === "md") {
            // Skip empty / whitespace-only segments
            if (!seg.content.trim()) return null;
            return (
              <ReactMarkdown key={i} remarkPlugins={[remarkGfm]}>
                {seg.content}
              </ReactMarkdown>
            );
          }

          // Task item
          const key = `${checklistId}:${seg.lineIndex}`;
          const isChecked = !!checks[key];

          return (
            <div
              key={i}
              onClick={() => toggle(key)}
              className="flex items-start gap-3 py-1.5 cursor-pointer group select-none"
              role="checkbox"
              aria-checked={isChecked}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  toggle(key);
                }
              }}
            >
              {/* Custom checkbox */}
              <span
                className={[
                  "mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200",
                  isChecked
                    ? "border-primary bg-primary text-white"
                    : "border-border dark:border-border group-hover:border-primary/60",
                ].join(" ")}
              >
                {isChecked && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </span>

              {/* Label — render inline markdown (bold, code, links) */}
              <span
                className={[
                  "flex-1 text-[14px] leading-relaxed transition-all duration-200",
                  isChecked ? "line-through text-muted opacity-60" : "text-foreground",
                ].join(" ")}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <>{children}</>,
                  }}
                >
                  {seg.label}
                </ReactMarkdown>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
