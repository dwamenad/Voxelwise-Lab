import { describe, expect, it } from "vitest";
import { searchGlossary } from "@/lib/content/glossary";
import { searchContent } from "@/lib/content/search";

describe("reference search", () => {
  it("finds a glossary term by name", () => {
    expect(searchGlossary("varcope")[0]?.term).toBe("varcope");
  });

  it("returns both glossary and lesson context for varcope", () => {
    const results = searchContent("varcope");
    expect(results.some((result) => result.type === "Glossary")).toBe(true);
    expect(results.some((result) => result.type === "Lesson")).toBe(true);
  });

  it("handles fuzzy search and typos like mcflirtt and registrtion", () => {
    const results = searchContent("registrtion");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((r) => r.title.toLowerCase().includes("registration"))).toBe(true);
  });

  it("filters search results by category", () => {
    const commandsOnly = searchContent("fslmaths", "Commands");
    expect(commandsOnly.every((r) => r.type === "Command")).toBe(true);
  });
});

