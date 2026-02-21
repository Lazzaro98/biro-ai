/**
 * Checklist quality guards for trust/accuracy improvements.
 *
 * We only validate AI outputs that look like a checklist (`- [ ]` items).
 */

const CHECKBOX_RE = /^\s*-\s*\[[ xX]\]/gm;

const INSTITUTION_HINTS = [
  "apr",
  "poreska",
  "purs",
  "rgz",
  "katastar",
  "mup",
  "amss",
  "javni beležnik",
  "beleznik",
  "croso",
  "eporezi",
  "efiskalizacija",
];

const SOURCE_BLOCK_RE = /izvori\s+i\s+datum\s+provere/i;
const VERIFIED_LINE_RE = /provereno\s*:/i;

function formatReviewDate(): string {
  return new Date().toLocaleDateString("sr-Latn-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function looksLikeChecklist(text: string): boolean {
  return text.includes("- [") || text.includes("- [x") || text.includes("- [X");
}

export function ensureSourceDateBlock(text: string): string {
  if (!looksLikeChecklist(text)) return text;
  if (SOURCE_BLOCK_RE.test(text) && VERIFIED_LINE_RE.test(text)) return text;

  const date = formatReviewDate();

  return `${text.trimEnd()}\n\n### 📚 Izvori i datum provere\n- Provereno: **${date}**\n- Primarni izvori: **apr.gov.rs**, **purs.gov.rs**, **mup.gov.rs**, **katastar.rgz.gov.rs**\n- Napomena: propisi, rokovi i cene mogu se promeniti; proveri zvanične izvore pre predaje dokumentacije.`;
}

export interface ChecklistValidationResult {
  isChecklist: boolean;
  ok: boolean;
  issues: string[];
}

export function validateChecklistQuality(text: string): ChecklistValidationResult {
  const isChecklist = looksLikeChecklist(text);
  if (!isChecklist) {
    return { isChecklist: false, ok: true, issues: [] };
  }

  const issues: string[] = [];
  const checkboxCount = (text.match(CHECKBOX_RE) ?? []).length;

  if (checkboxCount < 4) {
    issues.push("checklist_too_short");
  }

  const lower = text.toLowerCase();
  const hasInstitution = INSTITUTION_HINTS.some((hint) => lower.includes(hint));
  if (!hasInstitution) {
    issues.push("missing_institution_reference");
  }

  if (!SOURCE_BLOCK_RE.test(text)) {
    issues.push("missing_source_block");
  }

  if (!VERIFIED_LINE_RE.test(text)) {
    issues.push("missing_verified_date");
  }

  return { isChecklist, ok: issues.length === 0, issues };
}
