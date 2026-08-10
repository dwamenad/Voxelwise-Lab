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
});

