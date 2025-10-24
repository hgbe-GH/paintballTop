import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createAddonSchema = z.object({
  name: z.string().trim().min(1, "Le nom est requis"),
  priceCents: z.number().int().min(0, "Le prix doit être positif"),
});

export async function GET() {
  try {
    const addons = await prisma.addon.findMany({
      orderBy: { priceCents: "asc" },
    });

    return NextResponse.json(addons);
  } catch (error) {
    console.error("Error fetching addons", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createAddonSchema.parse(body);

    const created = await prisma.addon.create({
      data: {
        name: parsed.name,
        priceCents: parsed.priceCents,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error creating addon", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
