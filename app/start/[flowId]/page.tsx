import type { Metadata } from "next";
import { FLOWS, FLOW_IDS } from "@/app/lib/flows";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return FLOW_IDS.map((flowId) => ({ flowId }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flowId: string }>;
}): Promise<Metadata> {
  const { flowId } = await params;
  const flow = FLOWS[flowId];
  if (!flow) return {};

  return {
    title: flow.title,
    description: flow.description,
    openGraph: {
      title: `${flow.title} | Biro AI`,
      description: flow.description,
    },
  };
}

export default async function StartFlowPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;
  const flow = FLOWS[flowId];

  if (!flow) {
    notFound();
  }

  return (
    <main className="relative min-h-dvh flex flex-col items-center justify-center px-5 py-16 overflow-x-hidden">
      <div className="relative z-10 w-full max-w-lg">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-dark hover:text-primary transition-colors mb-8 animate-fade-in-up py-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Početna
        </a>

        <div className="rounded-2xl glass-card gradient-border p-8 sm:p-10 animate-fade-in-up-delay-1">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-purple-500/10 text-2xl mb-5 glow-icon">
            {flow.icon}
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
            {flow.title}
          </h1>
          <p className="mt-3 text-muted-dark leading-relaxed">
            Postavljaću ti pitanja da bih razumeo tvoju situaciju, a onda dobijaš
            personalizovani vodič sa svim koracima.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href={`/chat/${flow.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-dark px-6 py-3.5 text-white font-semibold
                         hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              Započni razgovor
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-xl bg-primary/[0.06] border border-primary/10 p-4">
            <span className="text-lg shrink-0">💡</span>
            <p className="text-sm text-muted-dark leading-relaxed">
              Ceo proces traje <strong className="text-foreground">{flow.estimatedTime}</strong>. {flow.startPageTip}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
