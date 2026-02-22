"use client";

import { useCallback, useState } from "react";

interface ShareCardProps {
  /** Flow title, e.g. "Otvaranje firme" */
  title: string;
  /** Flow emoji icon */
  icon: string;
  /** Number of completed steps */
  completedSteps: number;
  /** Total number of steps */
  totalSteps: number;
  /** Optional flow params summary, e.g. "Beograd · DOO · IT" */
  summary?: string;
}

/** Instagram Story canvas dimensions (1080×1920) scaled down for perf */
const W = 1080;
const H = 1920;

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function generateCard(props: ShareCardProps): Promise<Blob | null> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return resolve(null);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, "#0f0e1a");
    bgGrad.addColorStop(0.5, "#1a1a3e");
    bgGrad.addColorStop(1, "#0f0e1a");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Decorative circles
    ctx.globalAlpha = 0.08;
    ctx.beginPath();
    ctx.arc(200, 400, 300, 0, Math.PI * 2);
    ctx.fillStyle = "#6366f1";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(880, 1400, 250, 0, Math.PI * 2);
    ctx.fillStyle = "#a855f7";
    ctx.fill();
    ctx.globalAlpha = 1;

    // Center card
    const cardX = 80;
    const cardY = 580;
    const cardW = W - 160;
    const cardH = 760;

    // Card shadow
    ctx.shadowColor = "rgba(99, 102, 241, 0.3)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 10;

    // Card background
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    cardGrad.addColorStop(0, "rgba(30, 30, 54, 0.95)");
    cardGrad.addColorStop(1, "rgba(20, 20, 40, 0.95)");
    ctx.fillStyle = cardGrad;
    ctx.fill();

    // Card border
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 40);
    ctx.strokeStyle = "rgba(99, 102, 241, 0.3)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon circle
    const iconCx = W / 2;
    const iconCy = cardY + 120;
    ctx.beginPath();
    ctx.arc(iconCx, iconCy, 60, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fill();

    // Icon emoji
    ctx.font = "56px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(props.icon, iconCx, iconCy + 4);

    // "Završio/la sam!"
    ctx.font = "bold 52px sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "center";
    ctx.fillText("Završio/la sam! 🎉", W / 2, cardY + 240);

    // Flow title
    ctx.font = "36px sans-serif";
    ctx.fillStyle = "#a5b4fc";
    ctx.fillText(props.title, W / 2, cardY + 310);

    // Summary line
    if (props.summary) {
      ctx.font = "28px sans-serif";
      ctx.fillStyle = "#94a3b8";
      ctx.fillText(props.summary, W / 2, cardY + 370);
    }

    // Progress bar
    const barX = cardX + 80;
    const barY = cardY + 440;
    const barW = cardW - 160;
    const barH = 32;
    const progress = props.totalSteps > 0 ? props.completedSteps / props.totalSteps : 0;

    // Bar background
    drawRoundedRect(ctx, barX, barY, barW, barH, 16);
    ctx.fillStyle = "rgba(99, 102, 241, 0.15)";
    ctx.fill();

    // Bar fill
    if (progress > 0) {
      const fillW = Math.max(barH, barW * progress);
      drawRoundedRect(ctx, barX, barY, fillW, barH, 16);
      const barGrad = ctx.createLinearGradient(barX, barY, barX + fillW, barY);
      barGrad.addColorStop(0, "#6366f1");
      barGrad.addColorStop(1, "#a855f7");
      ctx.fillStyle = barGrad;
      ctx.fill();
    }

    // Progress text
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#f8fafc";
    ctx.textAlign = "center";
    ctx.fillText(
      `${props.completedSteps}/${props.totalSteps} koraka završeno`,
      W / 2,
      barY + barH + 56,
    );

    // Checkmark for completed
    if (progress >= 1) {
      ctx.font = "64px sans-serif";
      ctx.fillText("✅", W / 2, barY + barH + 130);
    }

    // BezPapira branding at top
    ctx.font = "bold 44px sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#a5b4fc";
    ctx.fillText("📋 BezPapira", W / 2, 180);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("Vodič kroz papirologiju u Srbiji", W / 2, 230);

    // CTA at bottom
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#a5b4fc";
    ctx.textAlign = "center";
    ctx.fillText("bezpapira.rs", W / 2, H - 240);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("@bezpapira", W / 2, H - 190);

    // "Skeniraj i ti" CTA
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText("Probaj i ti — besplatno! 🚀", W / 2, H - 130);

    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export default function ShareChecklistCard(props: ShareCardProps) {
  const [status, setStatus] = useState<"idle" | "generating" | "done">("idle");

  const handleGenerate = useCallback(async () => {
    setStatus("generating");
    const blob = await generateCard(props);
    if (!blob) {
      setStatus("idle");
      return;
    }

    // Try native share first (mobile), fallback to download
    const file = new File([blob], "bezpapira-checklist.png", { type: "image/png" });

    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `BezPapira — ${props.title}`,
          text: `Upravo sam završio/la "${props.title}" uz BezPapira! 📋✅`,
        });
        setStatus("done");
        setTimeout(() => setStatus("idle"), 3000);
        return;
      } catch {
        // User cancelled or share failed — fall through to download
      }
    }

    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bezpapira-checklist.png";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("done");
    setTimeout(() => setStatus("idle"), 3000);
  }, [props]);

  return (
    <button
      type="button"
      onClick={handleGenerate}
      disabled={status === "generating"}
      className="inline-flex items-center gap-1.5 text-xs text-muted-dark hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 disabled:opacity-50"
      title="Napravi sliku za Instagram"
    >
      {status === "done" ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Preuzeto!
        </>
      ) : status === "generating" ? (
        <>
          <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generišem...
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Story slika
        </>
      )}
    </button>
  );
}
