import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { generateSlots, isNocturne } from "./slots";

const MINUTES_IN_HOUR = 60;

describe("slots helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("generateSlots", () => {
    it("generates slots that fit within the opening window", () => {
      const slots = generateSlots({ durationMin: MINUTES_IN_HOUR, open: "09:00", close: "12:00", stepMin: 60 });

      expect(slots).toHaveLength(3);
      expect(new Date(slots[0]).getHours()).toBe(9);
      expect(new Date(slots[1]).getHours()).toBe(10);
      expect(new Date(slots[2]).getHours()).toBe(11);
    });

    it("stops when the end would exceed the closing time", () => {
      const slots = generateSlots({ durationMin: 45, open: "10:00", close: "11:30", stepMin: 15 });

      expect(slots).toHaveLength(4);
      const lastSlot = new Date(slots.at(-1) ?? "");
      expect(lastSlot.getHours()).toBe(10);
      expect(lastSlot.getMinutes()).toBe(45);
    });
  });

  describe("isNocturne", () => {
    it("returns true when the start is after the threshold", () => {
      expect(isNocturne("2024-06-15T20:30:00.000Z", "20:00")).toBe(true);
    });

    it("returns false when the start is before the threshold", () => {
      expect(isNocturne("2024-06-15T18:45:00.000Z", "20:00")).toBe(false);
    });
  });
});
