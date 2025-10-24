import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { DEFAULT_OPENING_HOURS, getAppSettings, type DayKey } from "@/lib/settings";

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format horaire invalide (HH:MM)");

const dayScheduleSchema = z
  .object({
    open: timeSchema,
    close: timeSchema,
    closed: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.closed && value.open >= value.close) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "L'heure de fermeture doit être après l'ouverture",
        path: ["close"],
      });
    }
  });

const openingHoursSchema = z.object(
  (Object.keys(DEFAULT_OPENING_HOURS) as DayKey[]).reduce(
    (acc, day) => {
      acc[day] = dayScheduleSchema;
      return acc;
    },
    {} as Record<DayKey, typeof dayScheduleSchema>
  )
);

const settingsSchema = z
  .object({
    nocturneThreshold: z
      .number({ required_error: "L'heure de seuil nocturne est requise" })
      .int()
      .min(0)
      .max(23),
    minPlayers: z
      .number({ required_error: "Le minimum de joueurs est requis" })
      .int()
      .min(1),
    penaltyUnderMinCents: z
      .number({ required_error: "La pénalité est requise" })
      .int()
      .min(0),
    openingHours: openingHoursSchema,
    stripeEnabled: z.boolean(),
    depositType: z.enum(["NONE", "FIXED", "PERCENT"], {
      required_error: "Le type de dépôt est requis",
    }),
    depositFixedCents: z.number().int().min(0).nullable().optional(),
    depositPercent: z.number().int().min(0).max(100).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.depositType === "FIXED" && value.depositFixedCents == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Le montant fixe est requis",
        path: ["depositFixedCents"],
      });
    }

    if (value.depositType === "PERCENT") {
      if (!value.stripeEnabled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le paiement en ligne doit être activé pour un dépôt en %",
          path: ["stripeEnabled"],
        });
      }

      if (value.depositPercent == null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Le pourcentage est requis",
          path: ["depositPercent"],
        });
      }
    }
  });

function serializeSettings(settings: awaited<ReturnType<typeof getAppSettings>>) {
  return {
    id: settings.id,
    nocturneThreshold: settings.nocturneThreshold,
    minPlayers: settings.minPlayers,
    penaltyUnderMinCents: settings.penaltyUnderMinCents,
    openingHours: settings.openingHours,
    stripeEnabled: settings.stripeEnabled,
    depositType: settings.depositType,
    depositFixedCents: settings.depositFixedCents,
    depositPercent: settings.depositPercent,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function GET() {
  try {
    const settings = await getAppSettings();
    return NextResponse.json(serializeSettings(settings));
  } catch (error) {
    console.error("Error fetching settings", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = settingsSchema.parse(body);

    const data = {
      nocturneThreshold: parsed.nocturneThreshold,
      minPlayers: parsed.minPlayers,
      penaltyUnderMinCents: parsed.penaltyUnderMinCents,
      openingHours: parsed.openingHours,
      stripeEnabled: parsed.stripeEnabled,
      depositType: parsed.depositType,
      depositFixedCents:
        parsed.depositType === "FIXED" ? parsed.depositFixedCents ?? 0 : null,
      depositPercent:
        parsed.depositType === "PERCENT" ? parsed.depositPercent ?? 0 : null,
    };

    await prisma.settings.upsert({
      where: { id: "global" },
      update: data,
      create: { id: "global", ...data },
    });

    const settings = await getAppSettings();
    return NextResponse.json(serializeSettings(settings));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error updating settings", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
