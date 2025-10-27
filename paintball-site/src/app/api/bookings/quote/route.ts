import { NextResponse } from "next/server";
import { z } from "zod";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

const bookingQuoteSchema = z.object({
  packageId: z.string().min(1, "packageId is required"),
  groupSize: z.number().int().min(1, "groupSize must be at least 1"),
  startISO: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "startISO must be a valid ISO date"),
  addons: z
    .array(
      z.object({
        addonId: z.string().min(1, "addonId is required"),
        qty: z.number().int().min(1, "qty must be at least 1"),
      })
    )
    .default([]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { packageId, groupSize, startISO, addons } = bookingQuoteSchema.parse(body);

    const [pkg, addonEntities] = await Promise.all([
      prisma.package.findUnique({
        where: { id: packageId },
        select: { id: true, priceCents: true, durationMin: true },
      }),
      addons.length
        ? prisma.addon.findMany({
            where: { id: { in: addons.map((addon) => addon.addonId) } },
            select: { id: true, priceCents: true },
          })
        : Promise.resolve([]),
    ]);

    if (!pkg) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    if (addonEntities.length !== addons.length) {
      return NextResponse.json({ error: "One or more addons not found" }, { status: 404 });
    }

    const addonPriceMap = new Map(addonEntities.map((addon) => [addon.id, addon.priceCents]));

    const startDate = new Date(startISO);
    const endDate = new Date(startDate.getTime() + pkg.durationMin * 60_000);
    const nocturne = startDate.getHours() >= 20;

    const base = pkg.priceCents;
    const addonsTotal = addons.reduce((total, addon) => {
      const addonPrice = addonPriceMap.get(addon.addonId) ?? 0;
      return total + addonPrice * addon.qty;
    }, 0);
    const nocturneExtra = nocturne ? 400 * groupSize : 0;
    const underMinPenalty = groupSize < 8 ? (8 - groupSize) * 2_500 : 0;

    const totalCents = base + addonsTotal + nocturneExtra + underMinPenalty;

    const responseBody = {
      totalCents,
      nocturne,
      endISO: endDate.toISOString(),
      breakdown: {
        base,
        addons: addonsTotal,
        nocturneExtra,
        underMinPenalty,
      },
    };

    void logger.info("[BOOKING]", "Generated booking quote", {
      packageId,
      groupSize,
      totalCents,
      nocturne,
    });

    return NextResponse.json(responseBody);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    await logger.error("[BOOKING]", "Error generating booking quote", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
