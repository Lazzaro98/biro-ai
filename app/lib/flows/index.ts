import type { FlowConfig } from "./types";
import { otvaranjeFirmeFlow } from "./otvaranje-firme";
import { kupovinaStanaFlow } from "./kupovina-stana";
import { registracijaVozilaFlow } from "./registracija-vozila";
import { slobodanRazgovorFlow } from "./slobodan-razgovor";

export type { FlowConfig } from "./types";
export type { SuggestionStep, SavedChecklist } from "./types";

/** All available flows, keyed by slug */
export const FLOWS: Record<string, FlowConfig> = {
  "otvaranje-firme": otvaranjeFirmeFlow,
  "kupovina-stana": kupovinaStanaFlow,
  "registracija-vozila": registracijaVozilaFlow,
  "slobodan-razgovor": slobodanRazgovorFlow,
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

/** Flow metadata for landing page cards (excludes free-form consultation) */
export const FLOW_CARDS = FLOW_IDS
  .filter((id) => id !== "slobodan-razgovor")
  .map((id) => {
    const f = FLOWS[id];
    return {
      id: f.id,
      title: f.title,
      description: f.description,
      icon: f.icon,
    };
  });

/** Free-form consultation flow card */
export const CONSULT_CARD = (() => {
  const f = FLOWS["slobodan-razgovor"];
  return {
    id: f.id,
    title: f.title,
    description: f.description,
    icon: f.icon,
  };
})();
