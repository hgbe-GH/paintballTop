import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  id: z.string().min(1, "Identifiant requis"),
});

const updatePackageSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom est requis").optional(),
    priceCents: z.number().int().min(0, "Le prix doit être positif").optional(),
    durationMin: z.number().int().min(1, "La durée doit être supérieure à zéro").optional(),
    includedBalls: z.number().int().min(0).nullable().optional(),
    isPromo: z.boolean().optional(),
    isPublic: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Aucun champ à mettre à jour",
  });

export async function PATCH(request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);
    const body = await request.json();
    const parsed = updatePackageSchema.parse(body);

    const updated = await prisma.package.update({
      where: { id },
      data: {
        ...(parsed.name !== undefined ? { name: parsed.name } : {}),
        ...(parsed.priceCents !== undefined ? { priceCents: parsed.priceCents } : {}),
        ...(parsed.durationMin !== undefined ? { durationMin: parsed.durationMin } : {}),
        ...(parsed.includedBalls !== undefined
          ? { includedBalls: parsed.includedBalls ?? null }
          : {}),
        ...(parsed.isPromo !== undefined ? { isPromo: parsed.isPromo } : {}),
        ...(parsed.isPublic !== undefined ? { isPublic: parsed.isPublic } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error updating package", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: unknown }) {
  try {
    const { id } = paramsSchema.parse(params);

    await prisma.package.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error("Error deleting package", error);
    const prismaError = error as { code?: string };
    if (prismaError?.code === "P2025") {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
