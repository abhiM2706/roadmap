import { describe, it, expect } from "vitest";
import { BUILT_IN_ROADMAPS } from "./library";

describe("BUILT_IN_ROADMAPS", () => {
  it("has exactly 5 roadmaps", () => {
    expect(BUILT_IN_ROADMAPS).toHaveLength(5);
  });

  it("every roadmap has a unique id", () => {
    const ids = BUILT_IN_ROADMAPS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every roadmap has at least 1 step", () => {
    for (const r of BUILT_IN_ROADMAPS) {
      expect(r.steps.length).toBeGreaterThan(0);
    }
  });

  it("every step has a command, description, and valid xp", () => {
    for (const r of BUILT_IN_ROADMAPS) {
      for (const s of r.steps) {
        expect(s.command).toBeTruthy();
        expect(s.description).toBeTruthy();
        expect([5, 20]).toContain(s.xp);
      }
    }
  });

  it("all IDs are present", () => {
    const ids = BUILT_IN_ROADMAPS.map((r) => r.id);
    expect(ids).toContain("nextjs-tailwind");
    expect(ids).toContain("python-venv");
    expect(ids).toContain("express-typescript");
    expect(ids).toContain("fastapi-postgres");
    expect(ids).toContain("react-native-expo");
  });
});
