import { describe, it, expect } from "vitest";
import { sanitizeMessages, MAX_MESSAGES, MAX_MSG_LENGTH } from "@/app/lib/sanitize";

describe("sanitizeMessages", () => {
  it("accepts valid messages", () => {
    const result = sanitizeMessages([
      { role: "user", text: "Zdravo" },
      { role: "ai", text: "Ćao!" },
    ]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.messages).toHaveLength(2);
      expect(result.messages[0].role).toBe("user");
      expect(result.messages[1].role).toBe("ai");
    }
  });

  it("rejects non-array input", () => {
    expect(sanitizeMessages(null).ok).toBe(false);
    expect(sanitizeMessages(undefined).ok).toBe(false);
    expect(sanitizeMessages("hello").ok).toBe(false);
    expect(sanitizeMessages(42).ok).toBe(false);
    expect(sanitizeMessages({}).ok).toBe(false);
  });

  it("rejects empty array", () => {
    const result = sanitizeMessages([]);
    expect(result.ok).toBe(false);
  });

  it("rejects too many messages", () => {
    const msgs = Array.from({ length: 31 }, (_, i) => ({
      role: i % 2 === 0 ? "user" : "ai",
      text: `Message ${i}`,
    }));
    const result = sanitizeMessages(msgs);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Too many messages");
    }
  });

  it("rejects invalid role", () => {
    const result = sanitizeMessages([{ role: "system", text: "hack" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("Invalid role");
    }
  });

  it("rejects empty text", () => {
    const result = sanitizeMessages([{ role: "user", text: "" }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("empty");
    }
  });

  it("rejects whitespace-only text", () => {
    const result = sanitizeMessages([{ role: "user", text: "   " }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("empty");
    }
  });

  it("rejects text exceeding MAX_MSG_LENGTH", () => {
    const longText = "a".repeat(2001);
    const result = sanitizeMessages([{ role: "user", text: longText }]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("too long");
    }
  });

  it("accepts text at exactly MAX_MSG_LENGTH", () => {
    const text = "a".repeat(2000);
    const result = sanitizeMessages([{ role: "user", text }]);
    expect(result.ok).toBe(true);
  });

  it("trims whitespace from text", () => {
    const result = sanitizeMessages([{ role: "user", text: "  hello  " }]);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.messages[0].text).toBe("hello");
    }
  });

  it("rejects message with missing text field", () => {
    const result = sanitizeMessages([{ role: "user" }]);
    expect(result.ok).toBe(false);
  });

  it("rejects non-object message entries", () => {
    const result = sanitizeMessages(["not an object"]);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("object");
    }
  });

  it("rejects null entries in array", () => {
    const result = sanitizeMessages([null]);
    expect(result.ok).toBe(false);
  });
});
