import { describe, it, expect } from "vitest";
import {
  thresholdForLevel,
  levelForXp,
  xpForNextLevel,
  xpProgressInCurrentLevel,
} from "./xp";

describe("thresholdForLevel", () => {
  it("L1 = 0", () => expect(thresholdForLevel(1)).toBe(0));
  it("L2 = 100", () => expect(thresholdForLevel(2)).toBe(100));
  it("L3 = 300", () => expect(thresholdForLevel(3)).toBe(300));
  it("L4 = 600", () => expect(thresholdForLevel(4)).toBe(600));
  it("L5 = 1000", () => expect(thresholdForLevel(5)).toBe(1000));
});

describe("levelForXp", () => {
  it("0 XP = L1", () => expect(levelForXp(0)).toBe(1));
  it("99 XP = L1", () => expect(levelForXp(99)).toBe(1));
  it("100 XP = L2", () => expect(levelForXp(100)).toBe(2));
  it("299 XP = L2", () => expect(levelForXp(299)).toBe(2));
  it("300 XP = L3", () => expect(levelForXp(300)).toBe(3));
  it("1000 XP = L5", () => expect(levelForXp(1000)).toBe(5));
});

describe("xpForNextLevel", () => {
  it("from L1 next is 100", () => expect(xpForNextLevel(1)).toBe(100));
  it("from L2 next is 300", () => expect(xpForNextLevel(2)).toBe(300));
});

describe("xpProgressInCurrentLevel", () => {
  it("halfway through L1→L2", () => {
    const p = xpProgressInCurrentLevel(50, 1);
    expect(p.percent).toBe(50);
    expect(p.current).toBe(50);
    expect(p.needed).toBe(100);
  });
  it("start of L2", () => {
    const p = xpProgressInCurrentLevel(100, 2);
    expect(p.percent).toBe(0);
    expect(p.current).toBe(0);
  });
});
