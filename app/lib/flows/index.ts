import type { FlowConfig } from "./types";
import { otvaranjeFirmeFlow } from "./otvaranje-firme";
import { kupovinaStanaFlow } from "./kupovina-stana";
import { registracijaVozilaFlow } from "./registracija-vozila";

export type { FlowConfig } from "./types";
export type { SuggestionStep, SavedChecklist } from "./types";

/** All available flows, keyed by slug */
export const FLOWS: Record<string, FlowConfig> = {
  "otvaranje-firme": otvaranjeFirmeFlow,
  "kupovina-stana": kupovinaStanaFlow,
  "registracija-vozila": registracijaVozilaFlow,
};

/** All valid flow IDs — useful for generateStaticParams */
export const FLOW_IDS = Object.keys(FLOWS);

/** Get a flow config by ID. Throws if not found. */
export function getFlow(id: string): FlowConfig {
  const flow = FLOWS[id];
  if (!flow) {
    throw new Error(`Unknown flow: "${id}". Available flows: ${FLOW_IDS.join(", ")}`);
  }
  return flow;
}

/** Flow metadata for landing page cards */
export const FLOW_CARDS = FLOW_IDS.map((id) => {
  const f = FLOWS[id];
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    icon: f.icon,
  };
});
