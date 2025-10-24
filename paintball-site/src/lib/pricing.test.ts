import { describe, expect, it } from "vitest";

import {
  computeAddons,
  computeBase,
  computeDeposit,
  computeNocturneExtra,
  computeTotal,
  computeUnderMinimumPenalty,
} from "./pricing";

describe("computeBase", () => {
  it("calculates the base price as price per person times group size", () => {
    expect(computeBase(2500, 10)).toBe(25000);
  });

  it("rounds the price per person before multiplying", () => {
    expect(computeBase(199.6, 3)).toBe(600);
  });

  it("throws when group size is negative", () => {
    expect(() => computeBase(2000, -1)).toThrow(/groupSize cannot be negative/);
  });
});

describe("computeNocturneExtra", () => {
  it("returns the nocturne extra when the start time is after the threshold", () => {
    const start = "2024-01-01T21:00:00";
    expect(computeNocturneExtra(start, 5)).toBe(2000);
  });

  it("returns zero when the start time is before the threshold", () => {
    const start = "2024-01-01T19:00:00";
    expect(computeNocturneExtra(start, 5)).toBe(0);
  });

  it("supports custom threshold and per-person rates", () => {
    const start = "2024-01-01T18:30:00";
    expect(computeNocturneExtra(start, 4, 18, 250)).toBe(1000);
  });

  it("throws for invalid ISO strings", () => {
    expect(() => computeNocturneExtra("invalid", 5)).toThrow(
      /must be a valid ISO date string/
    );
  });
});

describe("computeUnderMinimumPenalty", () => {
  it("returns zero when the group meets the minimum", () => {
    expect(computeUnderMinimumPenalty(8)).toBe(0);
  });

  it("charges for missing players when group is under the minimum", () => {
    expect(computeUnderMinimumPenalty(5)).toBe(7500);
  });

  it("supports custom minimum and penalty values", () => {
    expect(computeUnderMinimumPenalty(2, 5, 1000)).toBe(3000);
  });
});

describe("computeAddons", () => {
  it("totals add-on costs", () => {
    expect(
      computeAddons([
        { priceCents: 500, qty: 2 },
        { priceCents: 1200, qty: 1 },
      ])
    ).toBe(2200);
  });

  it("returns zero for an empty list", () => {
    expect(computeAddons([])).toBe(0);
  });

  it("throws when quantity is fractional", () => {
    expect(() =>
      computeAddons([
        {
          priceCents: 100,
          // @ts-expect-error testing runtime validation
          qty: 1.5,
        },
      ])
    ).toThrow(/must be an integer/);
  });
});

describe("computeTotal", () => {
  it("sums all provided price components", () => {
    const total = computeTotal({
      base: 20000,
      addons: 3000,
      nocturneExtra: 1500,
      underMinPenalty: 2500,
    });

    expect(total).toBe(27000);
  });

  it("defaults missing components to zero", () => {
    expect(computeTotal({ base: 1000 })).toBe(1000);
  });

  it("throws when a component is negative", () => {
    expect(() =>
      computeTotal({
        base: 1000,
        addons: -1,
      })
    ).toThrow(/addons cannot be negative/);
  });
});

describe("computeDeposit", () => {
  it("returns zero when no deposit is configured", () => {
    expect(computeDeposit(20000, { type: "NONE" })).toBe(0);
  });

  it("returns the fixed amount for fixed deposits", () => {
    expect(computeDeposit(15000, { type: "FIXED", amountCents: 5000 })).toBe(5000);
  });

  it("computes a percentage when Stripe is enabled", () => {
    expect(
      computeDeposit(20000, { type: "PERCENT", percent: 25, stripeEnabled: true })
    ).toBe(5000);
  });

  it("ignores percentage deposits when Stripe is disabled", () => {
    expect(
      computeDeposit(20000, { type: "PERCENT", percent: 50, stripeEnabled: false })
    ).toBe(0);
  });

  it("throws when percentage exceeds 100", () => {
    expect(() =>
      computeDeposit(10000, { type: "PERCENT", percent: 150, stripeEnabled: true })
    ).toThrow(/percent cannot exceed 100/);
  });
});

