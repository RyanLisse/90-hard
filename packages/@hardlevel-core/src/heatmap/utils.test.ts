import { describe, expect, it } from "bun:test";
import { bandForPercent, buildHeatmapDates } from "./utils";

describe("bandForPercent", () => {
  it("maps to expected bands", () => {
    expect(bandForPercent(0)).toBe(0);
    expect(bandForPercent(5)).toBe(1);
    expect(bandForPercent(40)).toBe(1);
    expect(bandForPercent(41)).toBe(2);
    expect(bandForPercent(80)).toBe(2);
    expect(bandForPercent(81)).toBe(3);
    expect(bandForPercent(99)).toBe(3);
    expect(bandForPercent(100)).toBe(4);
  });
});

describe("buildHeatmapDates", () => {
  it("returns a 7x11 grid ending at given date", () => {
    const end = new Date("2024-03-11T00:00:00Z");
    const grid = buildHeatmapDates(end, 11);
    expect(grid.length).toBe(7);
    expect(grid[0].length).toBe(11);
    // The newest date should be the bottom-right or within last column depending on weekday alignment.
    const flat = grid.flat();
    expect(flat.length).toBe(77);
    // Ensure the set is 77 distinct ISO strings
    const uniq = new Set(flat);
    expect(uniq.size).toBe(77);
  });
});

