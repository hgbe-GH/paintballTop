const MINUTES_IN_MS = 60_000;

function parseTimeString(value: string, label: string): { hours: number; minutes: number } {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    throw new Error(`${label} must be in HH:MM format`);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours < 0 || hours > 23) {
    throw new Error(`${label} hour must be between 0 and 23`);
  }

  if (minutes < 0 || minutes > 59) {
    throw new Error(`${label} minutes must be between 0 and 59`);
  }

  return { hours, minutes };
}

function createDateForTime(hours: number, minutes: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
}

export function generateSlots({
  open = "09:00",
  close = "22:00",
  stepMin = 30,
  durationMin,
}: {
  open?: string;
  close?: string;
  stepMin?: number;
  durationMin: number;
}): string[] {
  if (!Number.isFinite(durationMin) || durationMin <= 0) {
    throw new Error("durationMin must be a positive number");
  }

  if (!Number.isFinite(stepMin) || stepMin <= 0) {
    throw new Error("stepMin must be a positive number");
  }

  const { hours: openHours, minutes: openMinutes } = parseTimeString(open, "open");
  const { hours: closeHours, minutes: closeMinutes } = parseTimeString(close, "close");

  const startBoundary = createDateForTime(openHours, openMinutes);
  const endBoundary = createDateForTime(closeHours, closeMinutes);

  if (startBoundary >= endBoundary) {
    return [];
  }

  const slots: string[] = [];
  for (let start = startBoundary.getTime(); start < endBoundary.getTime(); start += stepMin * MINUTES_IN_MS) {
    const end = start + durationMin * MINUTES_IN_MS;
    if (end > endBoundary.getTime()) {
      break;
    }

    slots.push(new Date(start).toISOString());
  }

  return slots;
}

export function isNocturne(startISO: string, threshold = "20:00"): boolean {
  if (typeof startISO !== "string" || startISO.trim() === "") {
    throw new Error("startISO must be a non-empty ISO string");
  }

  const date = new Date(startISO);
  if (Number.isNaN(date.getTime())) {
    throw new Error("startISO must be a valid ISO date string");
  }

  const { hours: thresholdHours, minutes: thresholdMinutes } = parseTimeString(threshold, "threshold");
  const startTotalMinutes = date.getHours() * 60 + date.getMinutes();
  const thresholdTotalMinutes = thresholdHours * 60 + thresholdMinutes;

  return startTotalMinutes >= thresholdTotalMinutes;
}
