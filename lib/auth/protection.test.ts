import { describe, expect, it } from "vitest";
import { requiresAuthentication } from "@/lib/auth/protection";

describe("protected routes", () => {
  it("keeps the dashboard open in demo mode", () => expect(requiresAuthentication("/dashboard", true)).toBe(false));
  it("protects the dashboard in connected mode", () => expect(requiresAuthentication("/dashboard", false)).toBe(true));
  it("does not protect public course lessons", () => expect(requiresAuthentication("/courses/fsl/lessons/start", false)).toBe(false));
});

