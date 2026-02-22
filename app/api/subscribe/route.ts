/**
 * POST /api/subscribe
 *
 * Saves newsletter email subscriptions.
 * Stores in a simple JSON file (or can be forwarded to an email service).
 * For a production setup, integrate with Mailchimp, Resend, ConvertKit, etc.
 */

import { log } from "@/app/lib/logger";
import { NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), ".data");
const SUBSCRIBERS_FILE = join(DATA_DIR, "subscribers.json");

async function getSubscribers(): Promise<string[]> {
  try {
    const raw = await readFile(SUBSCRIBERS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveSubscribers(emails: string[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(SUBSCRIBERS_FILE, JSON.stringify(emails, null, 2));
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.email !== "string") {
      return NextResponse.json({ error: "Email je obavezan" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Nevažeća email adresa" }, { status: 400 });
    }

    const subscribers = await getSubscribers();
    if (subscribers.includes(email)) {
      return NextResponse.json({ ok: true, message: "Već si prijavljen/a!" });
    }

    subscribers.push(email);
    await saveSubscribers(subscribers);

    log.info("newsletter.subscribe", { email: email.replace(/(.{2}).*(@.*)/, "$1***$2") });

    return NextResponse.json({ ok: true, message: "Uspešno! Hvala na prijavi." });
  } catch (err) {
    log.error("newsletter.error", { error: String(err) });
    return NextResponse.json({ error: "Greška servera" }, { status: 500 });
  }
}
