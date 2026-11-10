import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// Exercise the deployed pricing function without importing its Deno server.
const source = readFileSync("supabase/functions/chat/index.ts", "utf8");
const start = source.indexOf("const getPricingInfo = () => {");
const end = source.indexOf("// RAG Knowledge Base", start);
if (start < 0 || end < 0) throw new Error("Pricing function not found");
const getPrices = new Function(
  "getCurrentDate",
  `${source.slice(start, end)}; return getPricingInfo();`,
);

describe("Current November 2026 ticket prices", () => {
  it.each([
    ["basic", "26.900 Ft + áfa"],
    ["premium", "31.900 Ft + áfa"],
    ["vip", "89.900 Ft + áfa"],
  ])("returns the confirmed %s price", (ticket, price) => {
    const result = getPrices(() => new Date("2026-11-10T07:17:00Z"));
    expect(result.currentPrices[ticket].discounted).toBe(price);
  });
});