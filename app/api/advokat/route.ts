/**
 * POST /api/advokat
 *
 * Saves lawyer consultation lead requests.
 * Stores in a local JSON file (.data/lawyer-leads.json).
 * Phase 1: simple storage. Phase 2: email forwarding to partner lawyers.
 */

import { log } from "@/app/lib/logger";
import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const LEADS_FILE = join(DATA_DIR, "lawyer-leads.json");

interface LawyerLead {
  id: string;
  date: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  description: string;
}

async function getLeads(): Promise<LawyerLead[]> {
  try {
    const raw = await readFile(LEADS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveLeads(leads: LawyerLead[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LEADS_FILE, JSON.stringify(leads, null, 2));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Neispravan zahtev" }, { status: 400 });
    }

    const { name, email, phone, city, description } = body;

    // Validate required fields
    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Ime je obavezno (min. 2 karaktera)" }, { status: 400 });
    }
    if (typeof email !== "string" || !isValidEmail(email.trim())) {
      return NextResponse.json({ error: "Nevažeća email adresa" }, { status: 400 });
    }
    if (typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Opis problema je obavezan (min. 10 karaktera)" },
        { status: 400 },
      );
    }

    const lead: LawyerLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: typeof phone === "string" && phone.trim() ? phone.trim() : undefined,
      city: typeof city === "string" && city.trim() ? city.trim() : undefined,
      description: description.trim(),
    };

    const leads = await getLeads();
    leads.unshift(lead);
    await saveLeads(leads);

    log.info("lawyer.lead_created", {
      leadId: lead.id,
      email: lead.email.replace(/(.{2}).*(@.*)/, "$1***$2"),
    });

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    log.error("lawyer.lead_error", { error: String(err) });
    return NextResponse.json({ error: "Greška servera" }, { status: 500 });
  }
}
