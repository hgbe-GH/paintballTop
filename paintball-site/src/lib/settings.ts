import type { DepositType, Settings as PrismaSettings } from "@/generated/prisma/client";
import { prisma } from "./prisma";
import type { DepositConfig } from "./pricing";

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export const DAY_LABELS: Record<DayKey, string> = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

export type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

export type OpeningHours = Record<DayKey, DaySchedule>;

export type AppSettings = {
  id: string;
  nocturneThreshold: number;
  minPlayers: number;
  penaltyUnderMinCents: number;
  openingHours: OpeningHours;
  stripeEnabled: boolean;
  depositType: DepositType;
  depositFixedCents: number | null;
  depositPercent: number | null;
  createdAt: Date;
  updatedAt: Date;
};

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday: { open: "09:00", close: "18:00", closed: false },
  tuesday: { open: "09:00", close: "18:00", closed: false },
  wednesday: { open: "09:00", close: "18:00", closed: false },
  thursday: { open: "09:00", close: "18:00", closed: false },
  friday: { open: "09:00", close: "18:00", closed: false },
  saturday: { open: "09:00", close: "19:00", closed: false },
  sunday: { open: "10:00", close: "17:00", closed: true },
};

const DEFAULT_SETTINGS_BASE = {
  nocturneThreshold: 20,
  minPlayers: 8,
  penaltyUnderMinCents: 2500,
  openingHours: DEFAULT_OPENING_HOURS,
  stripeEnabled: false,
  depositType: "NONE" as DepositType,
  depositFixedCents: null,
  depositPercent: null,
};

export const DEFAULT_SETTINGS: AppSettings = {
  id: "global",
  ...DEFAULT_SETTINGS_BASE,
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

function normalizeTime(value: unknown, fallback: string): string {
  if (typeof value === "string" && TIME_REGEX.test(value)) {
    return value;
  }
  return fallback;
}

function normalizeBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  return fallback;
}

function normalizeOpeningHours(value: unknown): OpeningHours {
  const result: Partial<OpeningHours> = {};
  const source = (value && typeof value === "object") ? (value as Record<string, unknown>) : {};

  (Object.keys(DEFAULT_OPENING_HOURS) as DayKey[]).forEach((day) => {
    const fallback = DEFAULT_OPENING_HOURS[day];
    const entry = source[day];
    if (entry && typeof entry === "object") {
      const raw = entry as Record<string, unknown>;
      result[day] = {
        open: normalizeTime(raw.open, fallback.open),
        close: normalizeTime(raw.close, fallback.close),
        closed: normalizeBoolean(raw.closed, fallback.closed),
      };
    } else {
      result[day] = { ...fallback };
    }
  });

  return result as OpeningHours;
}

function mapSettings(settings: PrismaSettings): AppSettings {
  return {
    id: settings.id,
    nocturneThreshold: settings.nocturneThreshold ?? DEFAULT_SETTINGS_BASE.nocturneThreshold,
    minPlayers: settings.minPlayers ?? DEFAULT_SETTINGS_BASE.minPlayers,
    penaltyUnderMinCents: settings.penaltyUnderMinCents ?? DEFAULT_SETTINGS_BASE.penaltyUnderMinCents,
    openingHours: normalizeOpeningHours(settings.openingHours),
    stripeEnabled: settings.stripeEnabled ?? DEFAULT_SETTINGS_BASE.stripeEnabled,
    depositType: settings.depositType ?? DEFAULT_SETTINGS_BASE.depositType,
    depositFixedCents: settings.depositFixedCents ?? null,
    depositPercent: settings.depositPercent ?? null,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

export async function getAppSettings(): Promise<AppSettings> {
  const existing = await prisma.settings.findUnique({ where: { id: "global" } });

  if (!existing) {
    const created = await prisma.settings.create({
      data: {
        id: "global",
        openingHours: DEFAULT_OPENING_HOURS,
      },
    });
    return mapSettings(created);
  }

  return mapSettings(existing);
}

export function getDepositConfig(settings: AppSettings): DepositConfig {
  switch (settings.depositType) {
    case "FIXED":
      return {
        type: "FIXED",
        amountCents: Math.max(0, settings.depositFixedCents ?? 0),
      };
    case "PERCENT":
      return {
        type: "PERCENT",
        percent: Math.max(0, Math.min(100, settings.depositPercent ?? 0)),
        stripeEnabled: settings.stripeEnabled,
      };
    default:
      return { type: "NONE" };
  }
}

export function getPricingRules(settings: AppSettings): {
  nocturneThreshold: number;
  minPlayers: number;
  penaltyUnderMinCents: number;
  deposit: DepositConfig;
} {
  return {
    nocturneThreshold: settings.nocturneThreshold,
    minPlayers: settings.minPlayers,
    penaltyUnderMinCents: settings.penaltyUnderMinCents,
    deposit: getDepositConfig(settings),
  };
}
