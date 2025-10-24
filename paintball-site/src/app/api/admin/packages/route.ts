import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createPackageSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  priceCents: z.number().int().min(0, "Le prix doit être positif"),
  durationMin: z.number().int().min(1, "La durée doit être supérieure à zéro"),
  includedBalls: z.number().int().min(0).nullable().optional(),
  isPromo: z.boolean().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { priceCents: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createPackageSchema.parse(body);

    const created = await prisma.package.create({
      data: {
        name: parsed.name,
        priceCents: parsed.priceCents,
        durationMin: parsed.durationMin,
        includedBalls: parsed.includedBalls ?? null,
        isPromo: parsed.isPromo ?? false,
        isPublic: parsed.isPublic ?? true,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating package", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
