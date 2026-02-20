"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const CHECKS_KEY = "bezpapira:checks";

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
  /** When provided, each task item gets a "Pitaj AI" consultation button */
  flowId?: string;
};

export default function ChecklistRenderer({ checklistId, markdown, showProgress = true, flowId }: Props) {
  const [checks, setChecks] = useState<CheckState>(loadChecks);
  const router = useRouter();

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
            <span className={`text-sm font-semibold text-primary ${pct === 100 ? "animate-celebrate" : ""}`} aria-live="polite">
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
            <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-celebrate">
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
            <div key={i} className="flex items-start gap-1 py-0.5 group/item">
              <div
                onClick={() => toggle(key)}
                className="flex flex-1 items-start gap-3 py-1.5 cursor-pointer select-none min-w-0"
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
                      : "border-border dark:border-border hover:border-primary/60",
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

              {/* Consult AI button — visible on hover only */}
              {flowId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const consultText = encodeURIComponent(seg.label);
                    router.push(`/chat/${flowId}?consult=${consultText}`);
                  }}
                  className="mt-1.5 flex shrink-0 items-center justify-center
                             h-7 w-7 rounded-full
                             text-muted/40 hover:text-primary hover:bg-primary/10
                             opacity-0 group-hover/item:opacity-100 focus:opacity-100
                             active:scale-90
                             transition-all duration-200
                             focus:outline-none focus:ring-2 focus:ring-primary/30"
                  title="Pitaj AI o ovom koraku"
                  aria-label={`Konsultuj AI o: ${seg.label}`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
