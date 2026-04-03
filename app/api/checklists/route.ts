/**
 * API routes for user checklist storage.
 *
 * GET  /api/checklists — returns saved checklists for logged-in user
 * POST /api/checklists — saves a checklist for logged-in user
 * DELETE /api/checklists?id=xxx — deletes a checklist
 *
 * Stored in Upstash Redis: user:{userId}:checklists (JSON string)
 */

import { NextResponse } from "next/server";
import { auth } from "../../lib/auth";
import { Redis } from "@upstash/redis";

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function userKey(userId: string) {
  return `user:${userId}:checklists`;
}

type SavedChecklist = {
  id: string;
  date: string;
  flowId?: string;
  params: Record<string, string | undefined>;
  markdown: string;
};

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ checklists: [] }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ checklists: [] });
  }

  try {
    const raw = await redis.get<SavedChecklist[]>(userKey(session.user.id));
    return NextResponse.json({ checklists: raw ?? [] });
  } catch {
    return NextResponse.json({ checklists: [] });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const checklist: SavedChecklist = {
      id: body.id,
      date: body.date || new Date().toISOString(),
      flowId: body.flowId,
      params: body.params || {},
      markdown: body.markdown,
    };

    if (!checklist.id || !checklist.markdown) {
      return NextResponse.json({ error: "Missing id or markdown" }, { status: 400 });
    }

    // Load existing, append, save (JSON blob — good enough for < 100 checklists)
    const existing = (await redis.get<SavedChecklist[]>(userKey(session.user.id))) ?? [];

    // Replace if same ID exists (re-save), otherwise append
    const idx = existing.findIndex((c) => c.id === checklist.id);
    if (idx >= 0) {
      existing[idx] = checklist;
    } else {
      existing.unshift(checklist); // newest first
    }

    // Cap at 100 checklists per user
    const capped = existing.slice(0, 100);
    await redis.set(userKey(session.user.id), JSON.stringify(capped));

    return NextResponse.json({ ok: true, count: capped.length });
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const redis = getRedis();
  if (!redis) {
    return NextResponse.json({ error: "Storage unavailable" }, { status: 503 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const existing = (await redis.get<SavedChecklist[]>(userKey(session.user.id))) ?? [];
    const filtered = existing.filter((c) => c.id !== id);
    await redis.set(userKey(session.user.id), JSON.stringify(filtered));

    return NextResponse.json({ ok: true, count: filtered.length });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
