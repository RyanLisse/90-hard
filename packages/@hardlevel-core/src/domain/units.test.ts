import { describe, expect, it } from "bun:test";
import { kgToLbs, lbsToKg } from "./units";

describe("unit conversions", () => {
  it("kg <-> lbs roundtrip within rounding", () => {
    const kg = 80;
    const lbs = kgToLbs(kg);
    const back = lbsToKg(lbs);
    expect(Math.abs(back - kg)).toBeLessThanOrEqual(0.1);
  });
});

