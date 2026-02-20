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
    title: `Chat — ${flow.title}`,
    description: flow.description,
    openGraph: {
      title: `Chat — ${flow.title} | Biro AI`,
      description: flow.description,
    },
    robots: { index: false },
  };
}

export default async function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = await params;

  if (!FLOWS[flowId]) {
    notFound();
  }

  return children;
}
