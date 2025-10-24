type Numeric = number;

function assertFiniteNumber(value: Numeric, name: string): void {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
}

function assertNonNegative(value: Numeric, name: string): void {
  if (value < 0) {
    throw new Error(`${name} cannot be negative`);
  }
}

function assertInteger(value: Numeric, name: string): void {
  if (!Number.isInteger(value)) {
    throw new Error(`${name} must be an integer`);
  }
}

export function computeBase(priceCents: number, groupSize: number): number {
  assertFiniteNumber(priceCents, "priceCents");
  assertFiniteNumber(groupSize, "groupSize");
  assertNonNegative(priceCents, "priceCents");
  assertNonNegative(groupSize, "groupSize");
  assertInteger(groupSize, "groupSize");

  return Math.round(priceCents) * groupSize;
}

export function computeNocturneExtra(
  startISO: string,
  groupSize: number,
  thresholdHour = 20,
  perPersonCents = 400
): number {
  if (typeof startISO !== "string" || startISO.trim() === "") {
    throw new Error("startISO must be a non-empty ISO date string");
  }

  assertFiniteNumber(groupSize, "groupSize");
  assertNonNegative(groupSize, "groupSize");
  assertInteger(groupSize, "groupSize");
  assertFiniteNumber(thresholdHour, "thresholdHour");

  if (thresholdHour < 0 || thresholdHour > 23) {
    throw new Error("thresholdHour must be between 0 and 23");
  }

  assertFiniteNumber(perPersonCents, "perPersonCents");
  assertNonNegative(perPersonCents, "perPersonCents");

  const startDate = new Date(startISO);
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("startISO must be a valid ISO date string");
  }

  const startHour = startDate.getHours();

  if (startHour < thresholdHour) {
    return 0;
  }

  return Math.round(perPersonCents) * groupSize;
}

export function computeUnderMinimumPenalty(
  groupSize: number,
  min = 8,
  penaltyPerMissingCents = 2500
): number {
  assertFiniteNumber(groupSize, "groupSize");
  assertInteger(groupSize, "groupSize");
  assertNonNegative(groupSize, "groupSize");
  assertFiniteNumber(min, "min");
  assertInteger(min, "min");
  assertNonNegative(min, "min");
  assertFiniteNumber(penaltyPerMissingCents, "penaltyPerMissingCents");
  assertNonNegative(penaltyPerMissingCents, "penaltyPerMissingCents");

  if (groupSize >= min) {
    return 0;
  }

  const missingPlayers = min - groupSize;
  return Math.round(penaltyPerMissingCents) * missingPlayers;
}

export function computeAddons(
  addons: Array<{ priceCents: number; qty: number }>
): number {
  if (!Array.isArray(addons)) {
    throw new Error("addons must be an array");
  }

  return addons.reduce((total, addon, index) => {
    if (addon == null || typeof addon !== "object") {
      throw new Error(`addon at index ${index} must be an object`);
    }

    const { priceCents, qty } = addon;

    assertFiniteNumber(priceCents, `addons[${index}].priceCents`);
    assertFiniteNumber(qty, `addons[${index}].qty`);
    assertNonNegative(priceCents, `addons[${index}].priceCents`);
    assertNonNegative(qty, `addons[${index}].qty`);
    assertInteger(qty, `addons[${index}].qty`);

    return total + Math.round(priceCents) * qty;
  }, 0);
}

export function computeTotal({
  base = 0,
  addons = 0,
  nocturneExtra = 0,
  underMinPenalty = 0,
}: {
  base?: number;
  addons?: number;
  nocturneExtra?: number;
  underMinPenalty?: number;
}): number {
  const values = {
    base,
    addons,
    nocturneExtra,
    underMinPenalty,
  } as const;

  (Object.entries(values) as Array<[keyof typeof values, number]>).forEach(
    ([key, value]) => {
      assertFiniteNumber(value, key);
      assertNonNegative(value, key);
    }
  );

  return base + addons + nocturneExtra + underMinPenalty;
}

export type DepositConfig =
  | { type: "NONE" }
  | { type: "FIXED"; amountCents: number }
  | { type: "PERCENT"; percent: number; stripeEnabled: boolean };

export function computeDeposit(totalCents: number, config: DepositConfig): number {
  assertFiniteNumber(totalCents, "totalCents");
  assertNonNegative(totalCents, "totalCents");

  if (config.type === "NONE") {
    return 0;
  }

  if (config.type === "FIXED") {
    assertFiniteNumber(config.amountCents, "amountCents");
    assertNonNegative(config.amountCents, "amountCents");
    return Math.round(config.amountCents);
  }

  assertFiniteNumber(config.percent, "percent");
  assertNonNegative(config.percent, "percent");

  if (config.percent > 100) {
    throw new Error("percent cannot exceed 100");
  }

  if (!config.stripeEnabled) {
    return 0;
  }

  return Math.round((totalCents * config.percent) / 100);
}

